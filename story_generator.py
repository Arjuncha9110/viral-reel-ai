import json
import os
import re


try:
    from openai import OpenAI
except Exception:
    OpenAI = None


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
DEFAULT_TARGET_DURATION = 30
TRAVEL_STYLES = {"Luxury Travel", "Dark Cinematic", "Luxury Lifestyle"}
FINANCE_STYLES = {"Finance Motivation", "Stock Market", "Trading Psychology"}
TRAVEL_TERMS = {
    "travel",
    "trip",
    "itinerary",
    "hotel",
    "resort",
    "villa",
    "destination",
    "vacation",
    "holiday",
    "couple",
    "couples",
    "honeymoon",
    "book",
}
TRAVEL_PLACES = {
    "japan",
    "tokyo",
    "kyoto",
    "osaka",
    "bali",
    "ubud",
    "dubai",
    "maldives",
    "thailand",
    "thai",
    "phuket",
    "bangkok",
    "phi phi",
    "krabi",
    "chiang mai",
    "vietnam",
    "hanoi",
    "ha long",
    "halong",
    "danang",
    "da nang",
    "hoi an",
    "saigon",
    "ho chi minh",
    "sapa",
    "mekong",
    "ninh binh",
    "paris",
    "london",
    "singapore",
    "switzerland",
    "italy",
    "greece",
    "turkey",
    "goa",
    "kerala",
    "rajasthan",
    "bhutan",
    "paro",
    "thimphu",
    "punakha",
    "tiger's nest",
    "tigers nest",
    "nepal",
    "sri lanka",
}
ASTROLOGY_STYLES = {
    "Divine Panchang Daily",
    "Vedic Astrology",
    "Horoscope Guidance",
    "Numerology Guidance",
    "Astrology Daily Guidance",
    "Spiritual Festival Explainer",
    "Hindi Horoscope Shorts",
}
ASTROLOGY_TERMS = {
    "astrology",
    "astro",
    "panchang",
    "horoscope",
    "kundli",
    "nakshatra",
    "tithi",
    "rashifal",
    "jyotish",
    "zodiac",
    "numerology",
    "remedy",
    "festival",
    "ekadashi",
    "graha",
    "muhurat",
    "fortune",
}
ZODIAC_SIGNS = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
]

# ── NaomiWorldTourz Brand Config ──────────────────────────────────────────────
NAOMI_TRIGGER_TERMS = {"naomi", "naomiworldtourz", "naomiworld", "naomi world"}
NAOMIWORLDTOURZ_BRAND = {
    "brand": "NaomiWorldTourz",
    "cta_keyword": "PLAN",
    "cta_instruction": "Comment PLAN and NaomiWorldTourz will send you the full itinerary.",
    "instagram": "@naomiworldtourz",
}

# ── Hidden / Underrated Destination Mode ─────────────────────────────────────
HIDDEN_GEM_TRIGGER_TERMS = {
    "hidden", "underrated", "undiscovered", "offbeat", "lesser known",
    "not seeing everywhere", "not everyone knows", "smart traveler",
    "smart travelers", "forget bali", "hidden paradise", "hidden gem",
    "less crowded", "where smart", "unique destination", "not everywhere",
}

# Underrated destinations recommended for Indian travelers
HIDDEN_GEM_DESTINATION_POOL = [
    "Oman", "Georgia", "Albania", "Montenegro", "Jordan",
    "Kyrgyzstan", "Morocco", "Bhutan",
]

HIDDEN_GEM_BRAND_HOOKS = {
    "Oman": "Forget Bali. Smart Indian travelers are quietly booking Oman instead.",
    "Georgia": "Forget Europe. This hidden Caucasus gem is where Indian travelers are going next.",
    "Albania": "Forget Santorini. Albania has the same turquoise water with zero crowds.",
    "Montenegro": "Forget Croatia. Montenegro has Adriatic views, castles, and no crowds.",
    "Jordan": "Forget Egypt. Jordan has Petra, rose-red deserts, and the Dead Sea in one trip.",
    "Kyrgyzstan": "Forget Switzerland. This Central Asian gem has mountain lakes and zero tourist crowds.",
    "Morocco": "Forget Dubai. Morocco has ancient medinas, Sahara sunsets, and riad luxury for less.",
    "Bhutan": "Forget the usual mountain trips. Bhutan feels like the peaceful luxury escape nobody talks about enough.",
    "default": "Forget Bali. This hidden paradise is where smart travelers are going next.",
}

HIDDEN_GEM_SELLING_POINTS = {
    "Oman": [
        ("visa on arrival", "VISA ON ARRIVAL", "Indians get visa on arrival. No stress. No waiting. Just book and go."),
        ("oman luxury resort", "LUXURY FOR LESS", "Luxury resorts at half the Dubai price. Private beaches with almost no one on them."),
        ("oman muscat old city", "BARELY ANY CROWD", "No overcrowded tourist spots. Just you, the locals, and scenes that feel straight from a film."),
    ],
    "Georgia": [
        ("georgia tbilisi old town", "VISA FREE FOR INDIANS", "Georgia is visa-free for Indian passport holders. You can literally plan this trip this week."),
        ("georgia caucasus mountain", "EUROPE COST AT 30%", "European-quality scenery at thirty percent of the cost. Mountains, wine country, old castles, all in one country."),
        ("georgia wine region", "ALMOST NO CROWDS", "Almost no Indian tourists here yet. That is exactly why it feels like a discovery."),
    ],
    "Albania": [
        ("albania riviera beach", "VISA FREE ENTRY", "Visa-free for Indians in summer. Mediterranean waters with almost no tourists."),
        ("albania budget travel", "BUDGET PARADISE", "Albania is one of Europe's most affordable countries. Five-star experiences at two-star prices."),
        ("albania old town gjirokaster", "NO ONE TALKS ABOUT IT", "Indian travelers are not seeing this everywhere yet. That is your advantage."),
    ],
    "Montenegro": [
        ("montenegro bay of kotor", "EASY VISA", "Easy visa process. Adriatic coastline, medieval old towns, and dramatic fjords."),
        ("montenegro luxury hotel", "PREMIUM HONEYMOON VALUE", "Five-star honeymoon value without the five-star price tag. Couples come here and never want to leave."),
        ("montenegro adriatic coast", "BARELY DISCOVERED", "One of Europe's last undiscovered coastlines. Indian travelers are not going here yet."),
    ],
    "Jordan": [
        ("jordan petra treasury", "JORDAN PASS DEAL", "The Jordan Pass covers Petra and 40 plus attractions. Best value deal in the Middle East."),
        ("jordan wadi rum desert", "LESS CROWD THAN EGYPT", "Same region, far less crowd. Petra has the kind of silence that makes you feel the history."),
        ("jordan dead sea float", "PERFECT COUPLE TRIP", "Dead Sea floats, desert campfires, and a city older than time. Jordan is extraordinary for couples."),
    ],
    "Kyrgyzstan": [
        ("kyrgyzstan issyk kul lake", "VISA FREE FOR INDIANS", "Visa-free for Indian passport holders. Some of the most dramatic mountain scenery on earth."),
        ("kyrgyzstan mountain adventure", "BUDGET ADVENTURE", "Adventure and luxury at budget prices. Think Swiss Alps but with no tourist crowds."),
        ("kyrgyzstan nomad culture", "PURE DISCOVERY", "Almost no Indian travelers go here. That is exactly what makes it feel so worth saving."),
    ],
    "Morocco": [
        ("morocco riad marrakech", "VISA FREE FOR INDIANS", "Visa-free for Indians. Ancient medinas, Sahara sunsets, and boutique riad stays."),
        ("morocco sahara desert", "LUXURY RIAD VALUE", "Riad stays that feel like private palaces at a fraction of what Dubai resorts cost."),
        ("morocco marrakech souk", "BARELY ANY INDIAN CROWD", "Beautiful, historic, and barely on the Indian traveler's radar. The best time to go is now."),
    ],
    "Bhutan": [
        ("bhutan tiger nest monastery", "TIGER'S NEST MOMENT", "Tiger's Nest makes Bhutan feel spiritual, cinematic, and impossible to compare with anywhere else."),
        ("bhutan prayer flags mountains", "PEACE OVER CROWD", "No noisy tourist rush. Just prayer flags, mountain air, and a country built around happiness."),
        ("bhutan luxury lodge valley", "LUXURY WITH SILENCE", "The luxury here is not loud. It is quiet lodges, untouched valleys, and space to finally breathe."),
    ],
    "default": [
        ("scenic destination view", "VISA EASY", "Visa is easier than you think. Indian travelers can plan this in under a week."),
        ("luxury resort hidden destination", "LUXURY FOR LESS", "Five-star stays at prices that are half what you would pay in popular destinations."),
        ("uncrowded beach travel", "BARELY ANY CROWD", "No overcrowded tourist traps. Just beautiful places, real experiences, and room to breathe."),
    ],
}


def detect_naomi_brand(topic):
    """Return True if the brief mentions NaomiWorldTourz."""
    lower = topic.lower().replace("-", " ")
    return any(term in lower for term in NAOMI_TRIGGER_TERMS)


def detect_hidden_gem_mode(topic):
    """Return True if the brief is asking for a hidden/underrated destination reel."""
    lower = topic.lower()
    return any(term in lower for term in HIDDEN_GEM_TRIGGER_TERMS)


def pick_hidden_gem_destination(topic):
    """
    If the brief names a specific underrated destination, use it.
    Otherwise pick Oman as the default (strongest for Indian travelers).
    """
    lower = topic.lower()
    for dest in HIDDEN_GEM_DESTINATION_POOL:
        if dest.lower() in lower:
            return dest
    # Default: Oman — visa on arrival, luxury value, very visual, perfect for Indian travelers
    return "Oman"


def read_file(path, default=""):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip() or default
    except FileNotFoundError:
        return default


def target_duration_from_file():
    try:
        value = int(float(read_file("video_length.txt", str(DEFAULT_TARGET_DURATION))))
    except Exception:
        value = DEFAULT_TARGET_DURATION
    return max(20, min(value, 45))


def scale_story_durations(story, target_duration):
    total = sum(float(item.get("duration", 4)) for item in story) or 1
    scale = target_duration / total
    for item in story:
        item["duration"] = round(max(2.2, min(6.2, float(item.get("duration", 4)) * scale)), 2)
    return story


def clean_json(content):
    content = content.replace("`json", "").replace("`", "").strip()
    start = content.find("[")
    end = content.rfind("]")
    if start != -1 and end != -1:
        content = content[start:end + 1]
    return content


DESTINATION_ALIASES = {
    "Japan": ["japan", "tokyo", "kyoto", "osaka", "fuji", "shibuya", "sakura", "sushi", "shinkansen", "bullet train"],
    "Bali": ["bali", "ubud", "canggu", "seminyak", "uluwatu"],
    "Dubai": ["dubai", "burj", "marina", "desert safari", "palm jumeirah"],
    "Maldives": ["maldives", "overwater", "lagoon", "water villa"],
    "Thailand": ["thailand", "thai", "phuket", "bangkok", "krabi", "chiang mai", "phi phi", "koh samui"],
    "Vietnam": ["vietnam", "hanoi", "ha long", "halong", "danang", "da nang", "hoi an", "saigon", "ho chi minh", "sapa", "mekong", "ninh binh", "phu quoc"],
    "Paris": ["paris", "eiffel", "louvre"],
    "London": ["london"],
    "Singapore": ["singapore", "marina bay", "sentosa"],
    "Goa": ["goa", "anjuna", "baga", "palolem"],
    "Kerala": ["kerala"],
    "Rajasthan": ["rajasthan"],
    "Switzerland": ["switzerland"],
    "Italy": ["italy"],
    "Greece": ["greece"],
    "Turkey": ["turkey"],
    "New York": ["new york", "new york city"],
    "Los Angeles": ["los angeles"],
    "Miami": ["miami"],
    # Hidden gem / underrated destinations for Indian travelers
    "Oman": ["oman", "muscat", "salalah", "nizwa", "wahiba"],
    "Georgia": ["georgia", "tbilisi", "batumi", "kazbegi", "mestia", "caucasus"],
    "Albania": ["albania", "tirana", "saranda", "berat", "gjirokaster", "albanian riviera"],
    "Montenegro": ["montenegro", "kotor", "budva", "perast", "durmitor", "adriatic"],
    "Jordan": ["jordan", "petra", "wadi rum", "amman", "aqaba", "dead sea"],
    "Kyrgyzstan": ["kyrgyzstan", "bishkek", "issyk kul", "karakol", "osh"],
    "Morocco": ["morocco", "marrakech", "fes", "chefchaouen", "sahara", "casablanca", "essaouira"],
    "Bhutan": ["bhutan", "paro", "thimphu", "punakha", "tiger's nest", "tigers nest", "taktsang", "dzong", "prayer flags", "himalayan"],
}


def normalize_destination_name(value):
    lower = value.strip().lower()
    for destination, aliases in DESTINATION_ALIASES.items():
        if lower == destination.lower() or lower in aliases:
            return destination
    return value.strip().title()


def extract_destination(brief):
    brief = brief.strip()
    lower = brief.lower()

    for destination, aliases in DESTINATION_ALIASES.items():
        for alias in sorted(aliases, key=len, reverse=True):
            if re.search(rf"\b{re.escape(alias)}\b", lower):
                return destination

    # If brief requests a hidden/underrated destination, pick one intelligently
    if detect_hidden_gem_mode(brief):
        return pick_hidden_gem_destination(brief)

    words = re.findall(r"[A-Za-z]+", brief)
    stop_words = {
        "make", "create", "travel", "reel", "luxury", "cinematic", "viral",
        "emotional", "show", "first", "time", "visitors", "hook", "viewers",
        "seconds", "strong", "call", "action", "save", "trip", "naomi",
        "naomiworldtourz", "hidden", "underrated", "premium", "shareable",
        "instagram", "youtube", "reels", "shorts", "indian", "travelers",
        "breathtaking", "journey", "world", "most", "mysterious", "peaceful",
        "country", "iconic", "wide", "shot", "tone", "exclusive", "start",
        "transition", "colorful", "serene", "ancient", "only", "end",
    }

    preposition_match = re.search(
        r"\b(?:for|in|into|to|about|through|inside)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?)\b",
        brief,
    )
    if preposition_match:
        candidate = preposition_match.group(1).strip()
        candidate_words = candidate.lower().split()
        if candidate_words and candidate_words[0] not in stop_words:
            return normalize_destination_name(candidate)

    for word in words:
        if word.lower() not in stop_words and len(word) > 2:
            return normalize_destination_name(word)

    return "this destination"


def short_caption(text, fallback):
    lower = text.lower()
    if "save this" in lower and "itinerary" in lower:
        return "SAVE THIS ITINERARY"
    if "save this" in lower and "trip" in lower:
        return "SAVE THIS TRIP"

    words = re.findall(r"[A-Za-z0-9]+", text.upper())
    words = [word for word in words if word not in {"THE", "AND", "WITH", "YOUR", "THIS"}]
    caption = " ".join(words[:4]).strip()
    return caption or fallback


def caption_from_scene(scene_text):
    words = re.findall(r"[A-Za-z0-9]+", scene_text.upper())
    words = [
        word for word in words
        if word not in {"THE", "AND", "WITH", "YOUR", "THIS", "A", "AN", "FOR", "TO"}
    ]
    caption = " ".join(words[:3]).strip()
    return caption or "SAVE THIS"


def parse_story_flow(brief):
    match = re.search(
        r"show this exact story flow\s*:\s*(.+?)(?:\n\s*\n|the voiceover|keep captions|end with|$)",
        brief,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not match:
        return []

    raw = match.group(1)
    raw = re.sub(r"\band\b", ",", raw, flags=re.IGNORECASE)
    parts = [
        re.sub(r"\s+", " ", part).strip(" .:-")
        for part in raw.replace("\n", ",").split(",")
    ]
    return [part for part in parts if len(part) > 2][:7]


def scene_voice(destination, scene_text, index):
    clean = scene_text.strip().rstrip(".")
    templates = [
        f"Start with {clean}, the moment that makes {destination} feel worth saving.",
        f"Then move into {clean}, where the trip starts to feel personal.",
        f"Next comes {clean}, a detail that gives the story a stronger sense of place.",
        f"After that, show {clean}, the kind of moment people remember after the trip.",
        f"Keep the energy moving with {clean}, so the reel feels alive and real.",
        f"Then slow it down with {clean}, giving the story a premium emotional turn.",
        f"Close the journey with {clean}, the final moment that makes the itinerary feel complete.",
    ]
    return templates[min(index, len(templates) - 1)]


def prompt_flow_scenes(brief, destination):
    flow = parse_story_flow(brief)
    destination_lower = destination.lower()
    scenes = []

    for index, scene_text in enumerate(flow):
        query = scene_text.lower()
        if destination_lower not in query:
            query = f"{destination_lower} {query}"

        scenes.append({
            "visual": query,
            "queries": [
                query,
                f"{destination_lower} {scene_text.lower()} travel",
                f"{destination_lower} {scene_text.lower()} cinematic",
            ],
            "caption": caption_from_scene(scene_text),
            "voice": scene_voice(destination, scene_text, index),
            "destination": destination,
        })

    return scenes


def extract_cta(brief, destination):
    # NaomiWorldTourz brand-specific CTA detection — highest priority
    if detect_naomi_brand(brief):
        lower = brief.lower()
        # Check if "comment plan" or "comment PLAN" is mentioned
        if "comment plan" in lower or "comment PLAN" in brief:
            return "Comment PLAN and NaomiWorldTourz will send you the full itinerary."
        # If hidden gem + naomi, default to the brand CTA
        if detect_hidden_gem_mode(brief):
            return "Comment PLAN and NaomiWorldTourz will send you the full itinerary."
        return f"Follow NaomiWorldTourz and DM PLAN to get your personalised {destination} itinerary."

    match = re.search(r"(comment\s+\w+[^.!\n]+)", brief, flags=re.IGNORECASE)
    if match:
        cta = match.group(1).strip()
        return cta[0].upper() + cta[1:] if cta else cta

    match = re.search(r"(save this[^.!\n]+)", brief, flags=re.IGNORECASE)
    if match:
        cta = match.group(1).strip()
        return cta[0].upper() + cta[1:] if cta else cta

    match = re.search(r"(follow[^.!\n]+|dm[^.!\n]+|book[^.!\n]+)", brief, flags=re.IGNORECASE)
    if match:
        cta = match.group(1).strip()
        return cta[0].upper() + cta[1:] if cta else cta

    return f"If {destination} is on your list, save this itinerary before you book."


def destination_default_scenes(destination):
    destination_lower = destination.lower()

    custom = {
        "oman": [
            ("oman wadi shab turquoise", "WADI SHAB HITS HARD", "Wadi Shab is the kind of place that looks fake until you are actually standing in it."),
            ("muscat grand mosque architecture", "MUSCAT FEELS GRAND", "Muscat opens with grand mosques, golden domes, and streets that feel completely calm."),
            ("oman beach deserted luxury", "PRIVATE BEACH VIBES", "Private-feeling beaches with warm water and almost no one else around."),
            ("oman desert wahiba sands sunset", "DESERT SUNSET MOMENT", "The Wahiba Sands desert turns golden at sunset, the kind of scene people screenshot and save."),
            ("oman luxury resort infinity pool", "LUXURY FOR LESS", "Five-star resorts at prices that are genuinely half what you pay in Dubai."),
            ("oman old town nizwa fort", "OLD TOWN STORY", "Nizwa Fort and the old town give the trip a historic, cinematic layer that feels completely real."),
            ("oman couple travel romantic", "SAVE THIS ITINERARY", "Couples who find Oman say they have never had a trip that felt this premium and this personal."),
        ],
        "georgia": [
            ("tbilisi old town balcony", "TBILISI STARTS STRONG", "Tbilisi opens with carved wooden balconies, cobbled streets, and a vibe that feels like Europe but costs like Southeast Asia."),
            ("kazbegi mountain georgia", "KAZBEGI FEELS UNREAL", "Then Kazbegi slows everything down with dramatic mountain valleys and a church that appears straight out of a movie."),
            ("georgia wine region vineyard", "WINE COUNTRY MOMENT", "Georgia is one of the oldest wine countries on earth and the countryside shows it."),
            ("georgia cave city vardzia", "CAVE CITY DISCOVERY", "Vardzia cave city is the kind of discovery you feel lucky to have made before everyone else finds it."),
            ("tbilisi sulfur bath", "SULFUR BATHS EXPERIENCE", "The old sulfur baths are a complete sensory reset, warm, quiet, and totally unlike anything else."),
            ("georgia budget luxury hotel", "EUROPE COST AT 30 PERCENT", "Boutique hotels and great food at prices that feel almost unbelievable compared to Western Europe."),
            ("georgia mountain sunset couple", "SAVE THIS ROUTE", "The people who go to Georgia say they never expected it to be this beautiful, and they always go back."),
        ],
        "albania": [
            ("albania riviera turquoise beach", "ALBANIAN RIVIERA HITS", "The Albanian Riviera has turquoise water that rivals Greece or Croatia, with almost no one on the beach."),
            ("saranda beach albania", "SARANDA FEELS CLEAN", "Saranda is a beach town with Mediterranean light, clear water, and prices that are genuinely budget-friendly."),
            ("berat old town albania", "BERAT IS STUNNING", "Berat is a UNESCO World Heritage city with white Ottoman houses stacked on a hillside, pure cinematic beauty."),
            ("albania budget travel food", "BUDGET PARADISE", "You can eat, stay, and explore Albania for a fraction of what you'd spend anywhere else in Europe."),
            ("albania castle ruins view", "CASTLE VIEWS EVERYWHERE", "Medieval castles and ancient ruins around every corner, the kind of discovery that makes the reel feel real."),
            ("albania adriatic sunset", "GOLDEN HOUR WINS", "Golden hour over the Adriatic turns every frame into a scene worth saving."),
            ("albania couple travel hidden", "SAVE THIS BEFORE EVERYONE DOES", "Albanian Riviera is still undiscovered. Indian travelers are not going here yet. That is your advantage."),
        ],
        "montenegro": [
            ("kotor bay montenegro", "BAY OF KOTOR HITS", "The Bay of Kotor is one of the most dramatic coastlines in Europe, and almost no Indian traveler has seen it yet."),
            ("montenegro old town kotor", "OLD TOWN MAGIC", "Kotor old town has medieval walls, stone streets, and views that look unreal in the golden hour."),
            ("budva beach montenegro", "BUDVA BEACH CLUB ENERGY", "Budva brings the beach club energy, Adriatic water, summer vibes, and a completely uncrowded beach."),
            ("perast island church", "PERAST IS DREAMY", "Perast is the kind of tiny town where the whole afternoon can pass without you noticing."),
            ("montenegro luxury hotel fjord", "PREMIUM HONEYMOON STAY", "Luxury hotels built into the fjord walls. Honeymoon energy without honeymoon prices."),
            ("durmitor national park", "MOUNTAINS IN THE NORTH", "Durmitor National Park gives the trip a dramatic landscape that changes the whole feel."),
            ("montenegro sunset adriatic", "SAVE THIS COUPLE TRIP", "Montenegro is one of Europe's most visually powerful hidden gems, and couples who find it never regret it."),
        ],
        "jordan": [
            ("petra treasury jordan", "PETRA HITS DIFFERENT", "Petra in real life is a hundred times more powerful than any photo. You walk through a canyon and then it appears."),
            ("wadi rum desert jordan", "WADI RUM FEELS MARS", "Wadi Rum looks like another planet. Red desert, silence, and a sky full of stars at night."),
            ("dead sea jordan float", "FLOATING IS SURREAL", "The Dead Sea float is one of those experiences that sounds gimmicky until you are actually in it."),
            ("amman rooftop jordan", "AMMAN OPENS BIG", "Amman has a rooftop view, ancient citadel, and a food scene that most Indian travelers completely miss."),
            ("jordan budget luxury camp", "DESERT CAMP LUXURY", "Luxury desert camps under the stars in Wadi Rum. Premium experience at a price that surprises you."),
            ("jordan historical sites", "HISTORY EVERYWHERE", "Every city in Jordan has layers of history you can actually walk through, not just look at."),
            ("jordan couple travel scenic", "SAVE THIS PLAN", "Jordan Pass covers over forty sites. This is one of the best value trips in the Middle East right now."),
        ],
        "kyrgyzstan": [
            ("issyk kul lake kyrgyzstan", "ISSYK KUL IS STUNNING", "Issyk Kul is one of the largest mountain lakes on earth, blue water, snow peaks, and almost no one around."),
            ("karakol kyrgyzstan mountain", "MOUNTAIN TREKKING VIBES", "Karakol has mountain trekking, valley hikes, and landscape that rivals anything in the Swiss Alps."),
            ("kyrgyzstan nomad yurt camp", "NOMAD CULTURE EXPERIENCE", "A night in a traditional yurt camp under mountain skies is the kind of thing you remember for years."),
            ("bishkek kyrgyzstan city", "BISHKEK OPENS IT UP", "Bishkek is surprisingly modern, affordable, and the perfect base before heading into the mountains."),
            ("kyrgyzstan horse trek landscape", "HORSE TREK MOMENT", "Horse trekking through high-altitude valleys gives the reel that pure adventure, earned-it energy."),
            ("kyrgyzstan alpine meadow", "ALPINE MEADOW BEAUTY", "Alpine meadows in summer are the kind of scene that makes you wonder why no one told you about this place."),
            ("kyrgyzstan couple adventure travel", "SAVE THIS ADVENTURE", "Visa-free, budget-friendly, and almost undiscovered by Indian travelers. The time to go is now."),
        ],
        "morocco": [
            ("marrakech riad courtyard", "RIAD LIFE HITS DIFFERENT", "A riad in Marrakech is a private courtyard palace. You step through a plain door and into somewhere extraordinary."),
            ("morocco sahara desert camel", "SAHARA AT GOLDEN HOUR", "The Sahara at golden hour is one of the most cinematic experiences on earth, full stop."),
            ("chefchaouen blue city morocco", "BLUE CITY MAGIC", "Chefchaouen is the blue city, painted walls, mountain air, and a photogenic corner around every turn."),
            ("fes medina morocco old city", "FES MEDINA FEELS ANCIENT", "The Fes medina has medieval leather tanneries, spice markets, and streets unchanged for eight hundred years."),
            ("morocco luxury riad hotel", "RIAD LUXURY VALUE", "Boutique riad hotels that feel like private palaces at a fraction of Dubai resort prices."),
            ("essaouira ocean morocco", "OCEAN TOWN ESCAPE", "Essaouira is a coastal town with ocean winds, blue boats, and a laid-back vibe that resets everything."),
            ("morocco couple travel sunset", "SAVE THIS ITINERARY", "Visa-free for Indians. Ancient cities, Sahara sunsets, and riad luxury. Morocco is the hidden gem of 2026."),
        ],
        "vietnam": [
            ("hanoi old quarter street", "HANOI STARTS FAST", "Start in Hanoi, where old streets, scooter energy, and cafe corners pull you into the trip immediately."),
            ("ha long bay cruise", "HA LONG FEELS DREAMY", "Then Ha Long Bay slows everything down with limestone cliffs, quiet water, and a view that feels unreal."),
            ("ninh binh boat ride", "THE BOAT RIDE HITS", "Ninh Binh adds the cinematic nature moment, calm water, green cliffs, and pure escape."),
            ("hoi an lantern night", "LANTERNS AFTER DARK", "Hoi An at night brings the emotional turn, lanterns, warm streets, and that saved-itinerary feeling."),
            ("vietnam street food market", "EVERY BITE HITS", "The food scene keeps the story alive, from street stalls to night markets and dishes you remember."),
            ("danang beach luxury resort", "PREMIUM BUT REAL", "Then a beach resort moment makes the trip feel premium without losing the local texture."),
            ("vietnam sunset rooftop cafe", "SAVE THIS ROUTE", "Close with sunset, a cafe view, and the feeling that this route is worth booking."),
        ],
        "thailand": [
            ("bangkok rooftop skyline", "BANGKOK OPENS BIG", "Start with Bangkok from above, lights, rooftop views, and a first hit of city energy."),
            ("phuket luxury beach resort", "PHUKET FEELS EASY", "Then move into Phuket, where beach resorts make the escape feel effortless."),
            ("phi phi island boat", "ISLAND BOAT MOMENT", "Phi Phi gives the reel the water moment, blue views, boat rides, and instant save energy."),
            ("krabi limestone cliffs", "KRABI LOOKS UNREAL", "Krabi adds the cinematic nature shot, cliffs, beaches, and a scene that feels bigger in motion."),
            ("thai night market food", "EVERY BITE HITS", "The night markets bring the flavor, color, and quick moments that make the story feel real."),
            ("thailand temple sunrise", "QUIET MORNING RESET", "A temple morning gives the reel a peaceful turn before the final luxury moment."),
            ("thailand sunset beach club", "SAVE THIS ESCAPE", "End with sunset by the water, the clean CTA moment that makes people want the full itinerary."),
        ],
        "japan": [
            ("tokyo neon street", "TOKYO AFTER DARK", "Tokyo hits first with neon streets, late-night energy, and corners that feel alive."),
            ("mount fuji view", "FUJI FEELS QUIET", "Then Mount Fuji slows everything down with a view that feels almost unreal."),
            ("japan bullet train", "RIDE THE FUTURE", "The bullet train turns the journey itself into part of the experience."),
            ("kyoto temple", "KYOTO SLOWS TIME", "Kyoto brings the quiet side of the trip, temples, old streets, and a slower kind of beauty."),
            ("japan cherry blossoms", "BLOSSOMS EVERYWHERE", "Cherry blossoms make even the smallest walk feel like a scene worth saving."),
            ("japan sushi night market", "EVERY BITE HITS", "The food moments make every hour feel memorable, from counters to markets."),
            ("japan luxury hotel", "PREMIUM BUT REAL", "A premium hotel stay gives the ending a clean, bookable travel feel."),
        ],
        "bhutan": [
            ("bhutan tiger nest monastery", "TIGER'S NEST", "Tiger's Nest opens the story with a cliffside monastery that feels almost impossible in real life."),
            ("bhutan prayer flags mountains", "PRAYER FLAGS", "Prayer flags in the Himalayan wind make the whole journey feel quiet, sacred, and cinematic."),
            ("bhutan dzong monastery monks", "ANCIENT DZONGS", "Then the Dzongs and monks bring in the cultural detail that makes Bhutan feel unlike anywhere else."),
            ("bhutan paro valley mountains", "MOUNTAIN SILENCE", "The valleys slow everything down with mist, mountains, and a kind of silence people remember."),
            ("bhutan luxury lodge", "QUIET LUXURY", "A luxury lodge moment gives the reel its premium turn without losing the peaceful mood."),
            ("bhutan local culture market", "LOCAL SOUL", "Add local color, markets, and human details so the trip feels real, not just scenic."),
            ("bhutan sunset monastery", "SAVE THIS KINGDOM", "Close with golden light over the mountains and a clean reason to save this rare itinerary."),
        ],
    }

    scenes = custom.get(destination_lower)
    if scenes is None:
        scenes = [
            (f"{destination_lower} city arrival", f"{destination.upper()} OPENS BIG", f"Start with {destination}, the arrival moment that makes the whole trip feel worth saving."),
            (f"{destination_lower} landmark view", "THE VIEW HITS", "Then show the signature view, the kind of scene people instantly connect with the destination."),
            (f"{destination_lower} scenic nature", "NATURE FEELS UNREAL", "Move into the landscape so the reel has a wider, more cinematic feeling."),
            (f"{destination_lower} local food market", "EVERY BITE HITS", "Bring in food and local texture so the trip feels real, not generic."),
            (f"{destination_lower} luxury hotel resort", "PREMIUM ESCAPE", "Add the hotel or resort moment that makes the itinerary feel premium."),
            (f"{destination_lower} sunset view", "GOLDEN HOUR WINS", "Use sunset as the emotional turn before the ending."),
            (f"{destination_lower} night street", "SAVE THIS ROUTE", "Close with night energy and a clear reason to save the itinerary."),
        ]

    output = []
    for visual, caption, voice in scenes:
        query = visual.lower()
        if destination_lower not in query:
            query = f"{destination_lower} {query}"
        output.append({
            "visual": query,
            "queries": [query, f"{query} travel", f"{query} cinematic"],
            "caption": caption,
            "voice": voice,
            "destination": destination,
        })
    return output


def prompt_scene_library(brief, destination):
    lower = brief.lower()
    destination_lower = destination.lower()
    flow_scenes = prompt_flow_scenes(brief, destination)
    if flow_scenes:
        return flow_scenes

    scenes = [
        {
            "keys": ["private pool villa", "pool villa", "villa"],
            "visual": "bali private pool villa",
            "queries": ["bali private pool villa", "bali villa pool", "luxury bali villa"],
            "caption": "PRIVATE VILLA LIFE",
            "voice": "Imagine waking up in a private pool villa where the whole morning already feels planned for you.",
            "places": ["bali"],
        },
        {
            "keys": ["floating breakfast", "breakfast"],
            "visual": "bali floating breakfast",
            "queries": ["bali floating breakfast", "pool breakfast bali", "luxury resort breakfast"],
            "caption": "FLOATING BREAKFAST",
            "voice": "Then the day starts slowly, floating breakfast, soft light, and no rush to be anywhere else.",
            "places": ["bali"],
        },
        {
            "keys": ["ubud", "jungle"],
            "visual": "ubud jungle view",
            "queries": ["ubud jungle view", "bali jungle", "bali rice terrace"],
            "caption": "UBUD FEELS CALM",
            "voice": "Ubud brings the calm part of Bali, jungle views, green mornings, and space to breathe.",
            "places": ["bali"],
        },
        {
            "keys": ["waterfall"],
            "visual": "bali waterfall",
            "queries": ["bali waterfall", "ubud waterfall", "tropical waterfall"],
            "caption": "WATERFALL MOMENT",
            "voice": "The waterfall moments make the trip feel wild, fresh, and impossible not to save.",
            "places": ["bali"],
        },
        {
            "keys": ["beach club", "beach sunset", "sunset"],
            "visual": "bali beach club sunset",
            "queries": ["bali beach club sunset", "bali sunset beach", "canggu beach club"],
            "caption": "SUNSET HITS DIFFERENT",
            "voice": "By sunset, the beach clubs turn Bali into a golden-hour escape.",
            "places": ["bali"],
        },
        {
            "keys": ["scooter", "couple scooter"],
            "visual": "bali couple scooter",
            "queries": ["bali scooter ride", "couple scooter bali", "bali road trip"],
            "caption": "ROAD TRIP ENERGY",
            "voice": "Even the scooter rides between places feel like part of the memory.",
            "places": ["bali"],
        },
        {
            "keys": ["romantic dinner", "dinner"],
            "visual": "bali romantic dinner",
            "queries": ["bali romantic dinner", "beach dinner bali", "luxury dinner bali"],
            "caption": "DINNER IN PARADISE",
            "voice": "And a romantic dinner closes the day with the kind of moment couples come here for.",
            "places": ["bali"],
        },
        {
            "keys": ["burj khalifa", "dubai skyline", "skyline"],
            "visual": "dubai skyline",
            "queries": ["dubai skyline", "burj khalifa", "dubai city view"],
            "caption": "SKYLINE FEELS UNREAL",
            "voice": "Dubai starts with a skyline that makes the whole trip feel larger than life.",
            "places": ["dubai"],
        },
        {
            "keys": ["dubai marina", "marina night", "marina"],
            "visual": "dubai marina night",
            "queries": ["dubai marina night", "dubai city lights", "dubai waterfront"],
            "caption": "MARINA AFTER DARK",
            "voice": "At night, the Marina turns into the kind of view couples remember long after the trip.",
            "places": ["dubai"],
        },
        {
            "keys": ["private yacht", "yacht"],
            "visual": "dubai yacht",
            "queries": ["dubai yacht", "luxury yacht ocean", "dubai marina yacht"],
            "caption": "YACHT MOMENTS",
            "voice": "Then come the yacht moments, quiet water, city lights, and that luxury escape feeling.",
            "places": ["dubai"],
        },
        {
            "keys": ["desert safari", "desert", "safari"],
            "visual": "dubai desert safari",
            "queries": ["dubai desert safari", "desert sunset", "dubai desert"],
            "caption": "DESERT AT SUNSET",
            "voice": "The desert changes the mood completely, warm sunset, open space, and pure cinematic energy.",
            "places": ["dubai"],
        },
        {
            "keys": ["rooftop dinner", "rooftop"],
            "visual": "dubai rooftop dinner",
            "queries": ["dubai rooftop dinner", "rooftop restaurant night", "luxury dinner view"],
            "caption": "DINNER WITH A VIEW",
            "voice": "A rooftop dinner makes the city feel personal, romantic, and made for a special night.",
            "places": ["dubai"],
        },
        {
            "keys": ["gold souk", "premium shopping", "shopping", "souk"],
            "visual": "dubai gold souk",
            "queries": ["dubai gold souk", "dubai shopping", "luxury shopping mall"],
            "caption": "GOLD AND GLAMOUR",
            "voice": "From gold souks to premium shopping, Dubai keeps adding moments that feel impossible to skip.",
            "places": ["dubai"],
        },
        {
            "keys": ["tokyo neon", "neon street", "tokyo night", "shibuya"],
            "visual": "tokyo neon street",
            "queries": ["tokyo neon street", "shibuya crossing", "tokyo city lights"],
            "caption": "TOKYO AFTER DARK",
            "voice": "Tokyo hits first with neon streets, late-night energy, and corners that feel alive.",
            "places": ["japan", "tokyo"],
        },
        {
            "keys": ["mount fuji", "fuji"],
            "visual": "mount fuji view",
            "queries": ["mount fuji view", "fuji sunrise", "japan mountain landscape"],
            "caption": "FUJI FEELS QUIET",
            "voice": "Then Mount Fuji slows everything down with a view that feels almost unreal.",
            "places": ["japan", "tokyo"],
        },
        {
            "keys": ["bullet train", "shinkansen", "train"],
            "visual": "japan bullet train",
            "queries": ["japan bullet train", "shinkansen train", "train station japan"],
            "caption": "RIDE THE FUTURE",
            "voice": "The bullet train turns the journey itself into part of the experience.",
            "places": ["japan", "tokyo"],
        },
        {
            "keys": ["kyoto", "temple", "temples", "shrine"],
            "visual": "kyoto temple",
            "queries": ["kyoto temple", "japan shrine", "kyoto old street"],
            "caption": "KYOTO SLOWS TIME",
            "voice": "Kyoto brings the quiet side of the trip, temples, old streets, and a slower kind of beauty.",
            "places": ["japan", "kyoto"],
        },
        {
            "keys": ["cherry blossom", "cherry blossoms", "sakura"],
            "visual": "japan cherry blossoms",
            "queries": ["japan cherry blossoms", "sakura street", "tokyo cherry blossom"],
            "caption": "BLOSSOMS EVERYWHERE",
            "voice": "Cherry blossoms make even the smallest walk feel like a scene worth saving.",
            "places": ["japan", "tokyo"],
        },
        {
            "keys": ["sushi", "food", "night market", "market", "dining"],
            "visual": f"{destination_lower} food night market",
            "queries": [f"{destination_lower} food", f"{destination_lower} night market", f"{destination_lower} restaurant"],
            "caption": "EVERY BITE HITS",
            "voice": "From local food spots to night markets, the flavors make every hour feel memorable.",
            "places": [],
        },
        {
            "keys": ["luxury hotel", "hotel stay", "premium hotel", "resort"],
            "visual": f"{destination_lower} luxury hotel",
            "queries": [f"{destination_lower} luxury hotel", f"{destination_lower} hotel pool", "luxury hotel room"],
            "caption": "PREMIUM BUT REAL",
            "voice": "And the best stays make the whole trip feel premium without losing the emotion.",
            "places": [],
        },
        {
            "keys": ["dubai", "burj khalifa", "yacht", "desert safari"],
            "visual": "dubai luxury travel",
            "queries": ["dubai skyline", "dubai luxury hotel", "dubai desert safari"],
            "caption": "DUBAI FEELS UNREAL",
            "voice": "This is the side of Dubai that feels bigger, brighter, and more cinematic in real life.",
            "places": ["dubai"],
        },
        {
            "keys": ["maldives", "overwater", "beach villa"],
            "visual": "maldives luxury resort",
            "queries": ["maldives resort", "overwater villa", "maldives beach"],
            "caption": "PARADISE FEELS CLOSE",
            "voice": "The Maldives feels calm from the first second, blue water, soft mornings, and pure escape.",
            "places": ["maldives"],
        },
    ]

    matched = []
    for scene in scenes:
        places = scene.get("places", [])
        if places and not any(place in destination_lower or place in lower for place in places):
            continue
        if any(key in lower for key in scene["keys"]):
            matched.append(scene)

    fallback_scenes = destination_default_scenes(destination)
    if matched:
        specific_matched = [scene for scene in matched if scene.get("places")]
        generic_matched = [scene for scene in matched if not scene.get("places")]
        if destination_lower in {"thailand", "vietnam"} and not specific_matched:
            return fallback_scenes
        matched = specific_matched + generic_matched
        used_visuals = {scene["visual"].lower() for scene in matched}
        for fallback_scene in fallback_scenes:
            if fallback_scene["visual"].lower() not in used_visuals:
                matched.append(fallback_scene)
            if len(matched) >= 7:
                break
        return matched

    return fallback_scenes


def build_travel_hook(topic, destination, first_scene):
    lower = topic.lower()
    destination_lower = destination.lower()

    # Brand-aware hooks for NaomiWorldTourz hidden gem briefs — highest priority
    is_naomi = detect_naomi_brand(topic)
    is_hidden = detect_hidden_gem_mode(topic)

    if is_naomi and is_hidden:
        hook = HIDDEN_GEM_BRAND_HOOKS.get(destination, HIDDEN_GEM_BRAND_HOOKS["default"])
        return hook

    # Generic hidden gem hook (non-branded)
    if is_hidden:
        return HIDDEN_GEM_BRAND_HOOKS.get(destination, HIDDEN_GEM_BRAND_HOOKS["default"])

    if "stop scrolling" in lower and "do not start" not in lower and "don't start" not in lower:
        return f"Stop scrolling. {destination} can feel unreal when the trip is planned around the right moments."

    if destination_lower == "bali":
        if any(word in lower for word in ["couple", "romantic", "honeymoon"]):
            return "Imagine waking up in Bali with a private pool, soft morning light, and the whole day made for two."
        return "Bali is not just beaches. It is the kind of escape you feel before the first sunset."

    if destination_lower in {"japan", "tokyo", "kyoto"}:
        return "Japan is the kind of trip where every small moment feels like a scene you want to replay."

    if destination_lower == "dubai":
        return "Dubai feels different when the trip is built around views, golden hours, and cinematic nights."

    if destination_lower == "maldives":
        return "The Maldives feels calm from the first morning, like the whole world has gone quiet for you."

    if destination_lower == "oman":
        return "Forget Bali. Smart Indian travelers are quietly booking Oman instead."

    if destination_lower == "georgia":
        return "Forget Europe. This hidden Caucasus gem is where Indian travelers are going next."

    if destination_lower == "morocco":
        return "Forget Dubai. Morocco has ancient medinas, Sahara sunsets, and riad luxury for less."

    if destination_lower == "bhutan":
        return "Bhutan feels like a secret mountain kingdom where every view is quieter than the last."

    if destination_lower == "jordan":
        return "Forget Egypt. Jordan has Petra, rose-red deserts, and the Dead Sea all in one trip."

    caption = first_scene.get("caption", f"{destination.upper()} FEELS UNREAL").lower()
    if "sunset" in caption:
        return f"{destination} starts to make sense the moment the light turns golden."

    return f"{destination} can feel like a dream when every stop has a reason behind it."


def build_hidden_gem_selling_beats(destination, target_duration):
    """
    Return 2-3 selling point beats for a hidden gem destination.
    These cover practical travel value: visa, budget, crowd, luxury.
    """
    points = HIDDEN_GEM_SELLING_POINTS.get(
        destination,
        HIDDEN_GEM_SELLING_POINTS["default"]
    )
    # Use 2 beats for 30s reels, 3 for 35s+
    count = 3 if target_duration >= 35 else 2
    beats = []
    for visual, caption, voice in points[:count]:
        beats.append({
            "duration": 3.5,
            "beat": "selling_point",
            "voice": voice,
            "visual": visual,
            "visual_queries": [visual, f"{destination.lower()} {visual}", f"{destination.lower()} travel"],
            "caption": caption,
            "destination": destination,
        })
    return beats


def prompt_driven_travel_story(topic, target_duration):
    destination = extract_destination(topic)
    cta = extract_cta(topic, destination)
    detail_scenes = prompt_scene_library(topic, destination)

    is_hidden = detect_hidden_gem_mode(topic)
    is_naomi = detect_naomi_brand(topic)

    # For hidden gem / NaomiWorldTourz briefs, reserve space for selling points
    if is_hidden or is_naomi:
        max_details = 4 if target_duration >= 35 else 3
    else:
        max_details = 7 if target_duration >= 35 else 6 if target_duration >= 30 else 4

    detail_scenes = detail_scenes[:max_details]

    hook_caption = (
        "FORGET BALI" if (is_hidden or is_naomi) and destination != "Bali"
        else f"{destination.upper()} FEELS UNREAL"
    )

    story = [
        {
            "duration": 2.8,
            "beat": "hook",
            "voice": build_travel_hook(topic, destination, detail_scenes[0]),
            "visual": detail_scenes[0]["visual"],
            "visual_queries": detail_scenes[0]["queries"],
            "caption": hook_caption,
            "destination": destination,
        }
    ]

    for index, scene in enumerate(detail_scenes, start=1):
        story.append({
            "duration": 3.5,
            "beat": "detail" if index < len(detail_scenes) else "payoff",
            "voice": scene["voice"],
            "visual": scene["visual"],
            "visual_queries": scene["queries"],
            "caption": scene["caption"],
            "destination": destination,
        })

    # Inject practical selling point beats (visa/budget/crowd) for hidden gem briefs
    if is_hidden or is_naomi:
        selling_beats = build_hidden_gem_selling_beats(destination, target_duration)
        story.extend(selling_beats)

    cta_caption = "COMMENT PLAN" if (is_naomi or "comment plan" in topic.lower()) else short_caption(cta, "SAVE THIS TRIP")
    story.append({
        "duration": 3.4,
        "beat": "cta",
        "voice": cta,
        "visual": detail_scenes[-1]["visual"],
        "visual_queries": detail_scenes[-1]["queries"],
        "caption": cta_caption,
        "destination": destination,
    })

    return scale_story_durations(story[:9], target_duration)


def is_astrology_mode(topic, style):
    lower = f"{topic} {style}".lower()
    return style in ASTROLOGY_STYLES or any(term in lower for term in ASTROLOGY_TERMS)


def is_travel_mode(topic, style):
    lower = f"{topic} {style}".lower()
    return (
        style in TRAVEL_STYLES
        or any(term in lower for term in TRAVEL_TERMS)
        or any(place in lower for place in TRAVEL_PLACES)
    )


def story_looks_astrology(story):
    if not isinstance(story, list):
        return False

    text = " ".join(
        " ".join(str(item.get(key, "")) for key in ["voice", "visual", "caption"])
        for item in story
        if isinstance(item, dict)
    ).lower()

    return any(term in text for term in ASTROLOGY_TERMS)


def story_matches_destination(story, expected_destination):
    if not expected_destination or expected_destination == "this destination":
        return True

    expected = normalize_destination_name(expected_destination)
    content = " ".join(
        (
            " ".join(
                str(item.get(key, ""))
                for key in ["destination", "voice", "visual", "caption"]
            )
            + " "
            + " ".join(str(value) for value in item.get("visual_queries", []) or [])
        )
        for item in story
        if isinstance(item, dict)
    ).lower()

    expected_aliases = DESTINATION_ALIASES.get(expected, [expected.lower()])
    if not any(re.search(rf"\b{re.escape(alias)}\b", content) for alias in expected_aliases):
        return False

    for destination, aliases in DESTINATION_ALIASES.items():
        if destination == expected:
            continue
        for alias in aliases:
            if re.search(rf"\b{re.escape(alias)}\b", content):
                return False

    return True


def stamp_story_destination(story, destination):
    if not isinstance(story, list):
        return story
    for item in story:
        if isinstance(item, dict):
            item["destination"] = destination
    return story


def extract_zodiac_sign(topic):
    lower = topic.lower()
    for sign in ZODIAC_SIGNS:
        if sign in lower:
            return sign.title()
    return ""


def astrology_focus_label(topic):
    sign = extract_zodiac_sign(topic)
    if sign:
        return f"{sign} guidance"

    lower = topic.lower()
    if "numerology" in lower:
        return "Numerology guidance"
    if "panchang" in lower:
        return "Panchang"
    if "festival" in lower:
        return "Festival guidance"
    if "kundli" in lower:
        return "Kundli guidance"
    if "horoscope" in lower:
        return "Daily horoscope"
    return "Panchang guidance"


def extract_astrology_cta(topic):
    match = re.search(r"(follow[^.!\n]+|dm[^.!\n]+|join[^.!\n]+|comment[^.!\n]+|whatsapp[^.!\n]+)", topic, flags=re.IGNORECASE)
    if match:
        cta = match.group(1).strip()
        return cta[0].upper() + cta[1:] if cta else cta
    return "Follow Divine Panchang for daily guidance that stays practical, calm, and clear."


def astrology_visual_library(topic):
    lower = topic.lower()
    visuals = [
        {
            "visual": "hindu temple sunrise",
            "queries": ["hindu temple sunrise", "temple bells morning", "india temple dawn"],
            "caption": "TODAYS ENERGY",
            "voice": "Before you rush into today, pause and check the energy you are stepping into.",
        },
        {
            "visual": "hands prayer candle",
            "queries": ["hands prayer candle", "devotional diya closeup", "morning prayer hands"],
            "caption": "PAUSE FIRST",
            "voice": "This is better for awareness, intention, and one grounded decision than emotional overreaction.",
        },
        {
            "visual": "woman journaling sunrise",
            "queries": ["woman journaling sunrise", "man writing notebook calm", "mindful journaling morning"],
            "caption": "ONE CLEAR STEP",
            "voice": "Pick one priority, finish one pending task, and keep your words measured today.",
        },
        {
            "visual": "meditation candle closeup",
            "queries": ["meditation candle closeup", "calm meditation room", "spiritual candle prayer"],
            "caption": "SIMPLE REMEDY",
            "voice": "A simple remedy is enough, light a diya, take three calm breaths, and set one clear intention.",
        },
        {
            "visual": "river sunrise spiritual",
            "queries": ["river sunrise spiritual", "ganga aarti morning", "sunrise water prayer"],
            "caption": "MOVE WITH CLARITY",
            "voice": "Let today be about clarity and rhythm, not fear, pressure, or impulsive promises.",
        },
    ]

    if "numerology" in lower:
        visuals[1] = {
            "visual": "number journal desk",
            "queries": ["number journal desk", "hands writing numbers", "numerology notebook closeup"],
            "caption": "CHECK YOUR NUMBER",
            "voice": "Look at your birth number as a reflection tool today, not as a guarantee of any outcome.",
        }
    elif "festival" in lower or "ekadashi" in lower or "ganga" in lower:
        visuals[2] = {
            "visual": "devotional river offering",
            "queries": ["devotional river offering", "ganga aarti diya", "festival prayer india"],
            "caption": "FESTIVAL FOCUS",
            "voice": "If you are observing today spiritually, keep the practice simple, sincere, and aligned with your routine.",
        }
    elif "kundli" in lower:
        visuals[2] = {
            "visual": "astrology chart notebook",
            "queries": ["astrology chart notebook", "kundli chart paper", "birth chart closeup"],
            "caption": "CHART CONTEXT",
            "voice": "Your birth chart gives context, but the value comes from how calmly you apply that insight.",
        }

    return visuals


def prompt_driven_astrology_story(topic, target_duration):
    focus = astrology_focus_label(topic)
    cta = extract_astrology_cta(topic)
    scenes = astrology_visual_library(topic)
    max_details = 5 if target_duration >= 30 else 4
    scenes = scenes[:max_details]

    story = [
        {
            "duration": 3.0,
            "beat": "hook",
            "voice": f"Before you make a big decision today, check this {focus.lower()} signal first.",
            "visual": scenes[0]["visual"],
            "visual_queries": scenes[0]["queries"],
            "caption": "CHECK THIS FIRST",
        }
    ]

    for index, scene in enumerate(scenes):
        story.append({
            "duration": 3.8,
            "beat": "detail" if index < len(scenes) - 1 else "payoff",
            "voice": scene["voice"],
            "visual": scene["visual"],
            "visual_queries": scene["queries"],
            "caption": scene["caption"],
        })

    story.append({
        "duration": 3.4,
        "beat": "cta",
        "voice": cta,
        "visual": scenes[-1]["visual"],
        "visual_queries": scenes[-1]["queries"],
        "caption": short_caption(cta, "FOLLOW FOR GUIDANCE"),
    })

    return scale_story_durations(story[:8], target_duration)


def fallback_story(topic, style, target_duration=DEFAULT_TARGET_DURATION):
    topic_title = extract_destination(topic)

    if style in FINANCE_STYLES or any(word in style for word in ["Finance", "Stock", "Trading"]):
        return scale_story_durations([
            {
                "duration": 3.2,
                "beat": "hook",
                "voice": "Most traders lose before the trade even starts.",
                "visual": "stock market screen",
                "visual_queries": ["stock market screen", "trading desk monitors", "market chart red"],
                "caption": "LOSING STARTS EARLY",
            },
            {
                "duration": 4.2,
                "beat": "problem",
                "voice": "They chase emotion, ignore discipline, and call it strategy.",
                "visual": "trading desk monitors",
                "visual_queries": ["trading desk monitors", "stressed trader laptop", "financial charts night"],
                "caption": "EMOTION IS NOT STRATEGY",
            },
            {
                "duration": 4.0,
                "beat": "turn",
                "voice": "The market rewards patience, not excitement.",
                "visual": "business office night",
                "visual_queries": ["business office night", "calm investor city", "financial district night"],
                "caption": "PATIENCE WINS",
            },
            {
                "duration": 4.2,
                "beat": "payoff",
                "voice": "One calm decision can protect your future.",
                "visual": "financial district skyline",
                "visual_queries": ["financial district skyline", "business city sunrise", "investor looking skyline"],
                "caption": "THINK LONG TERM",
            },
            {
                "duration": 4.2,
                "beat": "cta",
                "voice": "Trade less. Think clearly. Move with a plan.",
                "visual": "businessman city night",
                "visual_queries": ["businessman city night", "trader walking city", "office skyline night"],
                "caption": "MOVE WITH A PLAN",
            },
        ], target_duration)

    if is_travel_mode(topic, style):
        return prompt_driven_travel_story(topic, target_duration)

    if is_astrology_mode(topic, style):
        return prompt_driven_astrology_story(topic, target_duration)

    return scale_story_durations([
        {
            "duration": 3.2,
            "beat": "hook",
            "voice": f"Stop scrolling. This is what {topic_title} actually feels like.",
            "visual": f"{topic_title} skyline",
            "visual_queries": [f"{topic_title} skyline", f"{topic_title} street night", f"{topic_title} travel"],
            "caption": f"{topic_title.upper()} FEELS UNREAL",
        },
        {
            "duration": 3.6,
            "beat": "arrival",
            "voice": "The first thing that hits you is the view.",
            "visual": f"{topic_title} drone beach",
            "visual_queries": [f"{topic_title} scenic view", f"{topic_title} drone", f"{topic_title} landscape"],
            "caption": "THE VIEW HITS FIRST",
        },
        {
            "duration": 4.2,
            "beat": "luxury",
            "voice": "Then the hotels, the pools, and the places that look too perfect to be real.",
            "visual": f"{topic_title} luxury hotel pool",
            "visual_queries": [f"{topic_title} luxury hotel", f"{topic_title} resort pool", f"{topic_title} hotel room"],
            "caption": "LUXURY EVERYWHERE",
        },
        {
            "duration": 3.8,
            "beat": "local detail",
            "voice": "The food scene is everywhere, from hidden streets to rooftop dinners.",
            "visual": f"{topic_title} street food night",
            "visual_queries": [f"{topic_title} street food", f"{topic_title} night market", f"{topic_title} restaurant"],
            "caption": "STREETS TO ROOFTOPS",
        },
        {
            "duration": 3.8,
            "beat": "emotion",
            "voice": "And when the lights turn on, the whole city feels cinematic.",
            "visual": f"{topic_title} city nightlife",
            "visual_queries": [f"{topic_title} nightlife", f"{topic_title} city lights", f"{topic_title} night street"],
            "caption": "NIGHTS HIT DIFFERENT",
        },
        {
            "duration": 3.4,
            "beat": "cta",
            "voice": f"If {topic_title} is on your list, save this before you book.",
            "visual": f"{topic_title} sunset ocean",
            "visual_queries": [f"{topic_title} sunset", f"{topic_title} travel couple", f"{topic_title} airport"],
            "caption": "SAVE THIS TRIP",
        },
    ], target_duration)


def normalize_story(story, topic, style, target_duration=DEFAULT_TARGET_DURATION):
    if is_travel_mode(topic, style) and story_looks_astrology(story):
        story = None

    if not isinstance(story, list):
        story = fallback_story(topic, style, target_duration)

    cleaned = []

    for item in story:
        if not isinstance(item, dict):
            continue

        voice = str(item.get("voice", "")).strip()
        visual = str(item.get("visual", "")).strip()
        caption = str(item.get("caption", "")).strip()
        beat = str(item.get("beat", "")).strip() or "story"

        visual_queries = item.get("visual_queries", [])
        if isinstance(visual_queries, str):
            visual_queries = [visual_queries]
        elif not isinstance(visual_queries, list):
            visual_queries = []

        try:
            duration = float(item.get("duration", 4))
        except Exception:
            duration = 4.0

        duration = max(2.4, min(duration, 6.2))

        if voice and visual and caption:
            queries = [visual] + [str(query) for query in visual_queries]
            queries = [
                re.sub(r"\s+", " ", query.lower()).strip()
                for query in queries
                if str(query).strip()
            ]

            deduped_queries = []
            for query in queries:
                if query not in deduped_queries:
                    deduped_queries.append(query)

            clean_caption = re.sub(r"[^A-Za-z0-9\s]", "", caption.upper())
            clean_caption = re.sub(r"\s+", " ", clean_caption).strip()

            cleaned.append({
                "duration": duration,
                "beat": beat,
                "voice": voice,
                "visual": deduped_queries[0],
                "visual_queries": deduped_queries[:4],
                "caption": clean_caption[:34],
            })

    if not cleaned:
        cleaned = fallback_story(topic, style, target_duration)

    if is_travel_mode(topic, style) and target_duration >= 30 and len(cleaned) < 8:
        cleaned = fallback_story(topic, style, target_duration)

    total = sum(item["duration"] for item in cleaned)
    min_total = max(18, target_duration - 3)
    max_total = target_duration

    if total > max_total:
        scale = max_total / total
        for item in cleaned:
            item["duration"] = round(max(2.2, item["duration"] * scale), 2)
    elif total < min_total:
        scale = min_total / total
        for item in cleaned:
            item["duration"] = round(min(6.2, item["duration"] * scale), 2)

    return cleaned


def generate_with_openai(topic, style, target_duration):
    if OpenAI is None or not OPENAI_API_KEY:
        return None

    client = OpenAI(api_key=OPENAI_API_KEY)
    if is_travel_mode(topic, style):
        mode_hint = "travel itinerary storytelling"
    elif is_astrology_mode(topic, style):
        mode_hint = "astrology/spiritual guidance"
    else:
        mode_hint = "general short-form storytelling"

    # Detect brand/hidden gem context for richer AI prompting
    is_naomi = detect_naomi_brand(topic)
    is_hidden = detect_hidden_gem_mode(topic)
    brand_instruction = ""
    if is_naomi:
        brand_instruction = (
            "\nBrand: NaomiWorldTourz. End the reel with the exact CTA: "
            "'Comment PLAN and NaomiWorldTourz will send you the full itinerary.' "
            "The final caption must be: COMMENT PLAN\n"
        )
    hidden_instruction = ""
    if is_hidden:
        hidden_instruction = (
            "\nThis is a HIDDEN GEM reel for Indian travelers. "
            "The hook must start with 'Forget [popular destination].' style line. "
            "Include 2-3 beats about practical value: visa ease, budget advantage, low crowd. "
            "Make every beat feel like a discovery, not a generic ad.\n"
        )

    prompt = f"""
Create a prompt-faithful viral 9:16 reel story for this exact brief:
{topic}

Style:
{style}

Mode:
{mode_hint}
{brand_instruction}{hidden_instruction}
Return ONLY a valid JSON array of {"8 to 9" if target_duration >= 30 else "5 to 6"} objects.
Each object must have:
- duration: number of seconds, 2.4 to 6.2
- beat: hook, problem, detail, selling_point, payoff, or cta
- voice: exact narrator words for that beat
- visual: the best Pexels-style stock video search query, max 5 words
- visual_queries: 3 backup stock video search queries, each max 5 words
- caption: crisp viral caption, 2 to 4 words, ALL CAPS

Rules:
- Total duration must be {max(18, target_duration - 3)} to {target_duration} seconds.
- If the brief mentions a different duration, ignore that duration and use {target_duration} seconds.
- Preserve concrete details from the brief: places, products, emotions, audience, offers, and CTA.
- Build a connected mini-story: hook, specific details, selling points, emotional payoff, CTA.
- Vary the hook. Do not start with "Stop scrolling" unless the brief explicitly asks for that exact phrase.
- If the brief says not to use a phrase, obey it exactly.
- Every visual query must match the exact beat, not just the general topic.
- Use simple searchable stock-video phrases, not AI image prompts.
- Do not mention camera jargon, DSLR, ultra realistic, or cinematic in visual queries.
- Captions must be short, punchy, and easy to read in under one second. NO SENTENCES.
- Avoid generic captions like WATCH THIS, VIRAL, or AMAZING unless the brief asks for them.
- If the topic is astrology, panchang, numerology, or spiritual guidance, keep claims grounded and non-exploitative.
- Do not promise guaranteed outcomes, fear-based consequences, health cures, legal certainty, or financial certainty.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )

    content = clean_json(response.choices[0].message.content)
    return json.loads(content)


def main():
    topic = read_file("topic.txt", "Divine Panchang daily guidance")
    style = read_file("style.txt", "Divine Panchang Daily")
    target_duration = target_duration_from_file()

    story = None
    expected_destination = extract_destination(topic) if is_travel_mode(topic, style) else ""

    if is_travel_mode(topic, style):
        story = prompt_driven_travel_story(topic, target_duration)
        if not story_matches_destination(story, expected_destination):
            retry_topic = f"{expected_destination} travel reel. {topic}"
            story = prompt_driven_travel_story(retry_topic, target_duration)
        if not story_matches_destination(story, expected_destination):
            raise RuntimeError(
                f"Story destination validation failed. Prompt is for {expected_destination}, "
                "but the generated story used another destination."
            )
    else:
        try:
            story = generate_with_openai(topic, style, target_duration)
        except Exception as e:
            print(f"OpenAI story generation failed, using fallback: {e}")

    story = normalize_story(story, topic, style, target_duration)
    if expected_destination:
        story = stamp_story_destination(story, expected_destination)
        if not story_matches_destination(story, expected_destination):
            raise RuntimeError(
                f"Story destination validation failed after cleanup. Expected {expected_destination}."
            )

    with open("story.json", "w", encoding="utf-8") as f:
        json.dump(story, f, indent=4)

    scenes = [
        {
            "query": item["visual"],
            "queries": item.get("visual_queries", [item["visual"]]),
            "duration": item["duration"],
            "beat": item.get("beat", "story"),
            "caption": item["caption"],
            "destination": item.get("destination", expected_destination),
        }
        for item in story
    ]

    with open("scenes.json", "w", encoding="utf-8") as f:
        json.dump(scenes, f, indent=4)

    print("Story beats generated successfully")
    print(json.dumps(story, indent=2))


if __name__ == "__main__":
    main()
