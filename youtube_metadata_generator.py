import json
import os
import re
from pathlib import Path


try:
    from openai import OpenAI
except Exception:
    OpenAI = None


OUTPUT_PATH = Path("assets/youtube_metadata.json")
OVERRIDES_PATH = Path("assets/youtube_overrides.json")
ASTROLOGY_TERMS = {
    "astrology",
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

DESTINATION_ALIASES = {
    "Dubai": ["dubai", "burj khalifa", "burj", "marina", "desert safari"],
    "Japan": ["japan", "tokyo", "kyoto", "osaka", "fuji", "shibuya", "sushi", "shinkansen", "bullet train"],
    "Bali": ["bali", "ubud", "canggu", "seminyak", "uluwatu"],
    "Thailand": ["thailand", "thai", "phuket", "bangkok", "krabi", "chiang mai", "phi phi", "koh samui"],
    "Vietnam": ["vietnam", "hanoi", "ha long", "halong", "danang", "da nang", "hoi an", "saigon", "ho chi minh", "sapa", "mekong", "ninh binh"],
    "Bhutan": ["bhutan", "paro", "thimphu", "punakha", "tiger's nest", "tigers nest", "taktsang", "dzong", "prayer flags", "himalayan", "monastery"],
    "Paris": ["paris", "eiffel"],
    "London": ["london"],
    "Singapore": ["singapore", "marina bay", "sentosa"],
    "Maldives": ["maldives", "overwater", "lagoon"],
    "Switzerland": ["switzerland"],
    "Italy": ["italy"],
    "Greece": ["greece"],
    "Turkey": ["turkey"],
    "New York": ["new york", "new york city"],
    "Miami": ["miami"],
    "Goa": ["goa"],
    "Kerala": ["kerala"],
    "Rajasthan": ["rajasthan"],
}

BAD_METADATA_WORDS = {
    "not", "use", "old", "generic", "hooks", "fresh", "prompt", "instruction",
    "instructions", "developer", "logical", "agent", "code", "fix", "fixed",
    "fixable", "messing", "source", "sources", "caption", "captions", "scene",
    "scenes", "query", "queries", "avoid", "must", "should", "wrong", "stale",
}


def read_text(path, default=""):
    try:
        return Path(path).read_text(encoding="utf-8").strip() or default
    except FileNotFoundError:
        return default


def read_json(path, default):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return default


def clean_json(content):
    content = content.replace("```json", "").replace("```", "").strip()
    start = content.find("{")
    end = content.rfind("}")
    if start != -1 and end != -1:
        content = content[start:end + 1]
    return content


def extract_keywords(text):
    words = re.findall(r"[A-Za-z][A-Za-z0-9]+", text.lower())
    stop_words = {
        "create", "viral", "instagram", "reel", "video", "seconds", "second",
        "with", "that", "this", "from", "your", "show", "make", "start",
        "clear", "before", "after", "save", "book", "style", "strong",
        "for", "and", "the", "people", "stop", "scrolling", "makes",
        "talking", "avatar", "hindi", "english", "mix", "open", "fast",
        "hook", "keep", "warm", "grounded", "avoid", "claims", "follow",
        "daily", "today", "guidance", "using", "proper", "logic", "codex",
    }
    stop_words.update(BAD_METADATA_WORDS)
    keywords = []
    for word in words:
        if len(word) > 2 and word not in stop_words and word not in keywords:
            keywords.append(word)
    return keywords[:12]


def clean_tag_text(tag):
    tag = str(tag or "").strip()
    tag = tag[1:] if tag.startswith("#") else tag
    tag = re.sub(r"[^A-Za-z0-9]", "", tag)
    if not tag:
        return ""
    if tag.lower() in BAD_METADATA_WORDS:
        return ""
    return tag


def clean_hashtags(hashtags):
    if isinstance(hashtags, str):
        hashtags = re.split(r"[\s,]+", hashtags)
    cleaned = []
    for tag in hashtags or []:
        tag_text = clean_tag_text(tag)
        if not tag_text:
            continue
        hashtag = f"#{tag_text}"
        if hashtag not in cleaned:
            cleaned.append(hashtag)
    return cleaned


def clean_plain_tags(tags):
    if isinstance(tags, str):
        tags = re.split(r"[\s,]+", tags)
    cleaned = []
    for tag in tags or []:
        tag_text = clean_tag_text(tag).lower()
        if tag_text and tag_text not in cleaned:
            cleaned.append(tag_text)
    return cleaned


def remove_bad_hashtags_from_description(description):
    text = str(description or "")
    for word in BAD_METADATA_WORDS:
        text = re.sub(rf"#\s*{re.escape(word)}\b", "", text, flags=re.IGNORECASE)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def sanitize_metadata(metadata):
    metadata["hashtags"] = clean_hashtags(metadata.get("hashtags", []))[:20]
    metadata["tags"] = clean_plain_tags(metadata.get("tags", []))[:15]
    metadata["description"] = remove_bad_hashtags_from_description(metadata.get("description", ""))
    return metadata


def is_astrology_mode(topic, style):
    lower = f"{topic} {style}".lower()
    return any(term in lower for term in ASTROLOGY_TERMS)


def extract_destination(text):
    lower = text.lower()
    for destination, aliases in DESTINATION_ALIASES.items():
        for alias in sorted(aliases, key=len, reverse=True):
            if re.search(rf"\b{re.escape(alias)}\b", lower):
                return destination
    return ""


def metadata_matches_destination(metadata, destination):
    if not destination:
        return True

    text = " ".join(
        [
            str(metadata.get("title", "")),
            str(metadata.get("description", "")),
            " ".join(str(tag) for tag in metadata.get("hashtags", []) or []),
            " ".join(str(tag) for tag in metadata.get("tags", []) or []),
        ]
    ).lower()

    expected_aliases = DESTINATION_ALIASES.get(destination, [destination.lower()])
    if not any(re.search(rf"\b{re.escape(alias)}\b", text) for alias in expected_aliases):
        return False

    for other_destination, aliases in DESTINATION_ALIASES.items():
        if other_destination == destination:
            continue
        for alias in aliases:
            if re.search(rf"\b{re.escape(alias)}\b", text):
                return False

    return True


def astrology_focus_label(topic):
    lower = topic.lower()
    if "numerology" in lower:
        return "Numerology"
    if "kundli" in lower:
        return "Kundli"
    if "festival" in lower:
        return "Festival"
    if "horoscope" in lower:
        return "Horoscope"
    if "panchang" in lower:
        return "Panchang"
    return "Astrology"


def fallback_travel_metadata(topic, style, story):
    keywords = extract_keywords(topic + " " + style)
    destination = extract_destination(topic)
    if not destination:
        destination = next((word.title() for word in keywords if word not in {"for", "and", "the"}), "Travel")
    captions = [item.get("caption", "") for item in story if item.get("caption")]
    title = f"{destination} Luxury Travel Itinerary | Save Before You Book"
    hashtags = []

    for keyword in keywords:
        hashtags.append("#" + re.sub(r"[^A-Za-z0-9]", "", keyword.title()))

    for tag in ["#TravelShorts", "#LuxuryTravel", "#ViralReels", "#TravelGuide", "#VacationIdeas"]:
        if tag not in hashtags:
            hashtags.append(tag)

    description_lines = [
        f"Save this {destination} itinerary before you book.",
        "",
        f"A cinematic {destination} travel reel built for first-time visitors who want a premium, emotional, and easy-to-save trip idea.",
        "",
        "In this reel:",
    ]

    for caption in captions[:6]:
        description_lines.append(f"- {caption.title()}")

    description_lines.extend([
        "",
        "Save this Short for your travel planning and follow for cinematic travel reels, luxury itineraries, and destination ideas.",
        "",
        " ".join(hashtags[:15]),
    ])

    return {
        "title": title[:95],
        "description": "\n".join(description_lines),
        "hashtags": hashtags[:15],
        "tags": [tag.lstrip("#").lower() for tag in hashtags[:12]],
        "privacy_status": "private",
        "destination": destination,
    }


def fallback_astrology_metadata(topic, style, story):
    keywords = extract_keywords(topic + " " + style)
    focus = astrology_focus_label(topic)
    captions = [item.get("caption", "") for item in story if item.get("caption")]
    title = f"{focus} Guidance Today | Divine Panchang Daily Short"

    hashtags = [
        "#DivinePanchang",
        "#DailyHoroscope",
        "#VedicAstrology",
        "#Panchang",
        "#AstrologyGuidance",
        "#Jyotish",
    ]

    for keyword in keywords:
        tag = "#" + re.sub(r"[^A-Za-z0-9]", "", keyword.title())
        if tag not in hashtags:
            hashtags.append(tag)

    description_lines = [
        f"Daily {focus.lower()} guidance with one grounded takeaway.",
        "",
        "This short is for reflection, timing awareness, and simple spiritual routine support.",
        "It is not a guarantee of outcomes and should not replace professional advice for health, legal, or financial decisions.",
        "",
        "In this reel:",
    ]

    for caption in captions[:6]:
        description_lines.append(f"- {caption.title()}")

    description_lines.extend([
        "",
        "Follow Divine Panchang for daily panchang, horoscope-style guidance, remedies, festivals, and practical spiritual content.",
        "",
        " ".join(hashtags[:15]),
    ])

    return {
        "title": title[:95],
        "description": "\n".join(description_lines),
        "hashtags": hashtags[:15],
        "tags": [tag.lstrip("#").lower() for tag in hashtags[:12]],
        "privacy_status": "private",
    }


def fallback_metadata(topic, style, story):
    if is_astrology_mode(topic, style):
        return fallback_astrology_metadata(topic, style, story)
    return fallback_travel_metadata(topic, style, story)


def generate_with_openai(topic, style, story):
    api_key = os.getenv("OPENAI_API_KEY", "")
    if OpenAI is None or not api_key or api_key.startswith("replace_with") or api_key.startswith("paste_your"):
        return None

    client = OpenAI(api_key=api_key)
    overrides = read_json(OVERRIDES_PATH, {})
    metadata_prompt = (overrides.get("metadata_prompt") or "").strip()
    mode_hint = "astrology/spiritual discovery" if is_astrology_mode(topic, style) else "travel/lifestyle discovery"

    prompt = f"""
Create YouTube Shorts upload metadata automatically from this reel prompt and story.

Brief:
{topic}

Style:
{style}

Channel intent:
{mode_hint}

User metadata direction:
{metadata_prompt or "Use the brief itself. Make the metadata specific to this exact video, searchable, and conversion-focused."}

Story beats:
{json.dumps(story, indent=2)}

Return ONLY valid JSON with:
- title: clickable viral title, max 95 characters
- description: SEO-friendly description with a short hook, beat summary, CTA, and hashtags
- hashtags: array of 10 to 15 hashtags, each starts with #
- tags: array of 8 to 12 plain search tags, no #
- privacy_status: "private"

Rules:
- Make it attractive but not spammy.
- The title, description, hashtags, and tags must match the actual video topic automatically.
- If this is astrology, panchang, numerology, horoscope, kundli, or spiritual guidance content, optimize for search discovery around those terms.
- If this is astrology content, avoid fear-based claims, manipulative certainty, miracle claims, and exploitative language.
- Do not promise guaranteed health, legal, relationship, or financial outcomes.
- Include a clear follow, save, or join CTA when relevant.
- Do not use fake claims, discounts, or prices unless in the brief.
- Do not include meta-instructional, developer, or logical description keywords (like not, use, old, generic, hooks, fresh, agent, code, prompt, instruction, caption, source) in the hashtags or tags.
- Hashtags and tags must be real audience/search words from the destination, topic, niche, or travel style only.
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    return json.loads(clean_json(response.choices[0].message.content))


def apply_overrides(metadata, overrides):
    title = (overrides.get("title") or "").strip()
    description = (overrides.get("description") or "").strip()
    hashtags = (overrides.get("hashtags") or "").strip()
    metadata_prompt = (overrides.get("metadata_prompt") or "").strip()

    if title:
        metadata["title"] = title[:95]

    if description:
        metadata["description"] = description

    if hashtags:
        parsed = [
            tag if tag.startswith("#") else f"#{tag}"
            for tag in re.split(r"[\s,]+", hashtags)
            if tag.strip()
        ]
        metadata["hashtags"] = parsed[:20]
        metadata["tags"] = [tag.lstrip("#").lower() for tag in parsed[:12]]
        if description:
            metadata["description"] = description.rstrip() + "\n\n" + " ".join(parsed[:15])

    if metadata_prompt:
        metadata["metadata_prompt"] = metadata_prompt

    return metadata


def main():
    topic = read_text("topic.txt", "Divine Panchang daily guidance")
    style = read_text("style.txt", "Divine Panchang Daily")
    story = read_json("story.json", [])
    overrides = read_json(OVERRIDES_PATH, {})

    metadata = None
    try:
        metadata = generate_with_openai(topic, style, story)
    except Exception as e:
        print(f"YouTube metadata AI generation failed, using fallback: {e}")

    if not isinstance(metadata, dict):
        metadata = fallback_metadata(topic, style, story)

    expected_destination = "" if is_astrology_mode(topic, style) else extract_destination(topic)
    if expected_destination and not metadata_matches_destination(metadata, expected_destination):
        print(
            f"YouTube metadata destination mismatch. Expected {expected_destination}; using deterministic fallback."
        )
        metadata = fallback_travel_metadata(topic, style, story)

    metadata = apply_overrides(metadata, overrides)
    if expected_destination:
        metadata["destination"] = expected_destination
    metadata = sanitize_metadata(metadata)
    if len(metadata.get("hashtags", [])) < 5:
        fallback = fallback_metadata(topic, style, story)
        merged_hashtags = clean_hashtags(metadata.get("hashtags", []) + fallback.get("hashtags", []))
        merged_tags = clean_plain_tags(metadata.get("tags", []) + fallback.get("tags", []))
        metadata["hashtags"] = merged_hashtags[:15]
        metadata["tags"] = merged_tags[:12]
    OUTPUT_PATH.parent.mkdir(exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(metadata, indent=4), encoding="utf-8")

    print("YouTube metadata generated successfully")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
