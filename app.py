import glob
import os
import json
import re
import socket
import subprocess
import sys
from datetime import datetime
from pathlib import Path

import streamlit as st

# Import planet list from spiritual reel module (safe import)
try:
    from spiritual_story_reel import PLANETS as NAVAGRAHA_PLANETS, PLANET_LABELS as NAVAGRAHA_LABELS, PLANET_LIST as NAVAGRAHA_LIST
except Exception:
    NAVAGRAHA_PLANETS = {}
    NAVAGRAHA_LABELS = {}
    NAVAGRAHA_LIST = []

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    load_dotenv = None

if load_dotenv is not None:
    load_dotenv()


def load_local_env_file(path=".env"):
    env_path = Path(path)
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        existing = os.getenv(key)
        is_placeholder = not existing or any(p in str(existing).lower() for p in ["replace_with", "paste_your", "your_openai_api_key"])
        if key and value and (is_placeholder or not existing):
            os.environ[key] = value


def load_streamlit_secrets():
    for key in [
        "PEXELS_API_KEY",
        "PIXABAY_API_KEY",
        "OPENAI_API_KEY",
        "INSTAGRAM_ACCESS_TOKEN",
        "INSTAGRAM_USER_ID",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ]:
        try:
            value = st.secrets.get(key)
        except Exception:
            value = None

        if value and not os.getenv(key):
            os.environ[key] = str(value)


load_local_env_file()
load_local_env_file("api_keys.txt")
load_local_env_file("instagram_env_template.txt")
load_streamlit_secrets()

ASSETS_DIR = Path("assets")
LOGO_PATH = ASSETS_DIR / "logo.png"
MANUAL_CLIPS_DIR = ASSETS_DIR / "manual_clips"
CLIP_LIBRARY_DIR = ASSETS_DIR / "clip_library"
YOUTUBE_METADATA_PATH = ASSETS_DIR / "youtube_metadata.json"
YOUTUBE_OVERRIDES_PATH = ASSETS_DIR / "youtube_overrides.json"
CLIP_SOURCE_REPORT_PATH = ASSETS_DIR / "clip_source_report.json"
LATEST_VIDEO_PATH = Path("output/latest_video_path.txt")

STYLE_OPTIONS = [
    "Divine Panchang Daily",
    "Vedic Astrology",
    "Horoscope Guidance",
    "Numerology Guidance",
    "Luxury Travel",
    "Dark Cinematic",
    "Luxury Lifestyle",
    "Motivation",
    "Finance Motivation",
    "Stock Market",
    "Trading Psychology",
    "Astrology Daily Guidance",
    "Spiritual Festival Explainer",
    "Hindi Horoscope Shorts",
]

TRAVEL_DETECTION_TERMS = {
    "travel",
    "trip",
    "itinerary",
    "hotel",
    "resort",
    "villa",
    "vacation",
    "holiday",
    "honeymoon",
    "japan",
    "tokyo",
    "kyoto",
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
    "paris",
    "singapore",
    "goa",
    # NaomiWorldTourz brand + hidden gem terms
    "naomi",
    "naomiworldtourz",
    "naomiworld",
    "hidden",
    "underrated",
    "undiscovered",
    "offbeat",
    "hidden gem",
    "hidden paradise",
    "smart travelers",
    "less crowded",
    "forget bali",
    # Hidden gem destinations for Indian travelers
    "oman",
    "muscat",
    "salalah",
    "georgia",
    "tbilisi",
    "albania",
    "albanian riviera",
    "montenegro",
    "kotor",
    "jordan",
    "petra",
    "wadi rum",
    "kyrgyzstan",
    "morocco",
    "marrakech",
    "bhutan",
    "paro",
    "thimphu",
    "punakha",
    "tiger's nest",
    "tigers nest",
    "taktsang",
}

PLACE_CLIP_KEYWORDS = {
    "japan": {"japan", "tokyo", "kyoto", "fuji", "sushi", "shibuya", "osaka", "bullet", "shinkansen"},
    "bali": {"bali", "ubud", "canggu", "seminyak", "uluwatu", "villa", "waterfall", "floating", "scooter"},
    "dubai": {"dubai", "burj", "marina", "desert", "yacht", "souk"},
    "maldives": {"maldives", "overwater", "island", "lagoon", "beach", "resort"},
    "thailand": {"thailand", "thai", "phuket", "bangkok", "phi phi", "phi_phi", "krabi", "chiang mai", "chiang_mai", "elephant"},
    "vietnam": {"vietnam", "hanoi", "halong", "ha long", "ha_long", "danang", "da nang", "da_nang", "hoi an", "hoi_an", "saigon", "mekong", "sapa", "ninh binh", "ninh_binh"},
    # Hidden gem destinations
    "oman": {"oman", "muscat", "salalah", "nizwa", "wahiba", "wadi"},
    "georgia": {"georgia", "tbilisi", "kazbegi", "batumi", "caucasus"},
    "albania": {"albania", "saranda", "berat", "gjirokaster", "riviera"},
    "montenegro": {"montenegro", "kotor", "budva", "perast", "durmitor"},
    "jordan": {"jordan", "petra", "wadi rum", "amman", "dead sea"},
    "kyrgyzstan": {"kyrgyzstan", "issyk kul", "bishkek", "karakol"},
    "morocco": {"morocco", "marrakech", "fes", "sahara", "chefchaouen", "riad"},
    "bhutan": {"bhutan", "paro", "thimphu", "punakha", "tiger's nest", "tigers nest", "taktsang", "dzong", "prayer flags", "himalayan"},
}

PRESET_CONFIGS = {
    "NaomiWorldTourz Hidden Gem Reel": {
        "story_prompt": (
            "Create a 30-second viral travel reel for NaomiWorldTourz about a unique destination that Indian travelers "
            "are not seeing everywhere yet. Make it feel exciting, premium, and highly shareable. "
            "Destination theme: hidden or underrated international destination with strong visual appeal, easy planning "
            "value, and real traveler curiosity. Goal: generate leads for NaomiWorldTourz by making viewers comment or "
            "message for itinerary details. Style: fast hook in first 2 seconds, cinematic luxury-looking visuals, short "
            "punchy captions, emotional but practical, built for Instagram Reels and YouTube Shorts. "
            "Start with a strong hook like: Forget Bali. This hidden paradise is where smart travelers are going next. "
            "Show 5-7 visually striking moments: beaches, streets, food, hotel views, couple moments, scenic landmarks, "
            "local culture. Include 2-3 practical selling points: budget friendliness, visa ease, less crowd, better "
            "luxury value, great for honeymoon or family trip. End with the CTA: "
            "Comment PLAN and NaomiWorldTourz will send you the itinerary."
        ),
        "style": "Luxury Travel",
        "video_length": 30,
        "metadata_prompt": (
            "Optimise metadata for NaomiWorldTourz. Target Indian traveler discovery on Instagram Reels and YouTube Shorts. "
            "Use hashtags around hidden gem travel, underrated destinations, India travel, honeymoon packages, and "
            "budget luxury travel. Keep title curiosity-driven and clickable."
        ),
    },
    "Travel Reel": {
        "story_prompt": (
            "Japan luxury travel reel for first-time visitors. Make it cinematic, emotional, and viral. "
            "Show Tokyo neon streets, Mount Fuji, bullet train, Kyoto temples, cherry blossoms, sushi, "
            "night markets, luxury hotels, and end with a strong call to action to save this trip."
        ),
        "style": "Luxury Travel",
        "video_length": 30,
        "metadata_prompt": "",
    },
    "Divine Panchang Daily Avatar": {
        "story_prompt": (
            "Create a 30 second Divine Panchang daily talking-avatar reel in Hindi-English mix for May 25, 2026. "
            "Open with a fast hook about checking today's energy before making a big decision, then give one simple "
            "horoscope-style guidance, one practical caution, one non-fear-based remedy, and a CTA asking viewers "
            "to follow for daily guidance. Keep it warm, grounded, and viral. Avoid guaranteed predictions, fear "
            "language, medical claims, or exploitative astrology promises."
        ),
        "style": "Divine Panchang Daily",
        "video_length": 30,
        "metadata_prompt": (
            "Make the metadata fit Divine Panchang. Optimize for YouTube Shorts and Instagram discovery "
            "around panchang, rashifal, horoscope, daily guidance, zodiac signs, remedies, and spiritual habits. "
            "Keep claims soft and non-exploitative."
        ),
    },
    "Divine Panchang Festival Explainer": {
        "story_prompt": (
            "Create a 35 second Divine Panchang talking-avatar reel explaining an upcoming Hindu festival or vrat. "
            "Open with why this date matters now, then explain the spiritual meaning, one simple ritual or observance, "
            "one practical do or don't, and end with a CTA to save this and share with family. "
            "Keep it devotional, clear, and respectful. Avoid superstition-heavy fear tactics or guaranteed outcomes."
        ),
        "style": "Spiritual Festival Explainer",
        "video_length": 35,
        "metadata_prompt": (
            "Make the metadata searchable for festival name, vrat date, puja vidhi, panchang, Hindu calendar, "
            "and spiritual significance. Keep it factual, family-friendly, and save-worthy."
        ),
    },
}


def save_uploaded_logo(uploaded_logo):
    if uploaded_logo is None:
        return

    ASSETS_DIR.mkdir(exist_ok=True)
    LOGO_PATH.write_bytes(uploaded_logo.getbuffer())


def save_uploaded_clips(uploaded_clips):
    MANUAL_CLIPS_DIR.mkdir(parents=True, exist_ok=True)

    for old_clip in MANUAL_CLIPS_DIR.glob("*.mp4"):
        try:
            old_clip.unlink()
        except OSError:
            pass

    for index, uploaded_clip in enumerate(uploaded_clips or [], start=1):
        original_stem = Path(uploaded_clip.name).stem if uploaded_clip.name else f"clip_{index:02d}"
        safe_stem = re.sub(r"[^A-Za-z0-9]+", "_", original_stem).strip("_").lower()
        safe_stem = safe_stem or f"clip_{index:02d}"
        clip_path = MANUAL_CLIPS_DIR / f"{index:02d}_{safe_stem}.mp4"
        clip_path.write_bytes(uploaded_clip.getbuffer())


def save_youtube_overrides(metadata_prompt, title, description, hashtags):
    ASSETS_DIR.mkdir(exist_ok=True)
    payload = {
        "metadata_prompt": metadata_prompt.strip(),
        "title": title.strip(),
        "description": description.strip(),
        "hashtags": hashtags.strip(),
    }
    YOUTUBE_OVERRIDES_PATH.write_text(json.dumps(payload, indent=4), encoding="utf-8")


def load_youtube_metadata():
    if not YOUTUBE_METADATA_PATH.exists():
        return None

    try:
        return json.loads(YOUTUBE_METADATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        return None


def load_clip_source_report():
    if not CLIP_SOURCE_REPORT_PATH.exists():
        return []

    try:
        return json.loads(CLIP_SOURCE_REPORT_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []


def clear_render_artifacts(active_render_id=None):
    try:
        if LATEST_VIDEO_PATH.exists():
            LATEST_VIDEO_PATH.write_text("", encoding="utf-8")
            LATEST_VIDEO_PATH.unlink()
    except OSError:
        pass

    for root_file in ["story.json", "scenes.json", "render_id.txt", "avatar_hook_enabled.txt"]:
        try:
            if os.path.exists(root_file):
                os.remove(root_file)
        except OSError:
            try:
                with open(root_file, "w", encoding="utf-8") as f:
                    f.write("")
            except OSError:
                pass

    patterns = [
        "assets/music_source.json",
        "assets/voice.mp3",
        "assets/voice.wav",
        "assets/voice_manifest.json",
        "assets/voice_beats/*.mp3",
        "assets/voice_beats/*.wav",
        "assets/voice_beats/*/*.mp3",
        "assets/voice_beats/*/*.wav",
        "assets/clip_manifest.json",
        "assets/clip_source_report.json",
        "assets/youtube_metadata.json",
        "assets/clip*.mp4",
        "output/*.mp4",
    ]
    for pattern in patterns:
        for file in glob.glob(pattern, recursive=True):
            try:
                os.remove(file)
            except OSError:
                try:
                    os.rename(file, file + ".stale")
                except OSError:
                    pass

    render_clips_parent = Path("assets/render_clips")
    if render_clips_parent.exists() and render_clips_parent.is_dir():
        import shutil
        for sub in render_clips_parent.iterdir():
            if sub.is_dir() and (active_render_id is None or sub.name != active_render_id):
                try:
                    shutil.rmtree(sub)
                except Exception:
                    pass


def latest_rendered_video():
    if LATEST_VIDEO_PATH.exists():
        path = LATEST_VIDEO_PATH.read_text(encoding="utf-8").strip()
        if path and os.path.exists(path):
            return path
    return None


def validate_destination_alignment(expected_place):
    if not expected_place:
        return True, ""

    story_path = Path("story.json")
    if story_path.exists():
        try:
            story = json.loads(story_path.read_text(encoding="utf-8"))
            for index, item in enumerate(story):
                text_content = " ".join([
                    str(item.get("voice", "")),
                    str(item.get("visual", "")),
                    str(item.get("caption", "")),
                ]).lower()
                keywords = PLACE_CLIP_KEYWORDS.get(expected_place, {expected_place})
                if not any(k in text_content for k in keywords):
                    return False, f"story.json beat {index+1} does not match destination {expected_place.title()}"
        except Exception as e:
            return False, f"Story validation error: {e}"

    scenes_path = Path("scenes.json")
    if scenes_path.exists():
        try:
            scenes = json.loads(scenes_path.read_text(encoding="utf-8"))
            for index, item in enumerate(scenes):
                text_content = " ".join([
                    str(item.get("query", "")),
                    " ".join(str(q) for q in item.get("queries", []) or [])
                ]).lower()
                keywords = PLACE_CLIP_KEYWORDS.get(expected_place, {expected_place})
                if not any(k in text_content for k in keywords):
                    return False, f"scenes.json beat {index+1} does not match destination {expected_place.title()}"
        except Exception as e:
            return False, f"Scenes validation error: {e}"

    meta_path = Path("assets/youtube_metadata.json")
    if meta_path.exists():
        try:
            metadata = json.loads(meta_path.read_text(encoding="utf-8"))
            text_content = " ".join([
                str(metadata.get("title", "")),
                str(metadata.get("description", "")),
                " ".join(metadata.get("hashtags", []) or []),
                " ".join(metadata.get("tags", []) or [])
            ]).lower()
            keywords = PLACE_CLIP_KEYWORDS.get(expected_place, {expected_place})
            if not any(k in text_content for k in keywords):
                return False, f"YouTube metadata does not match destination {expected_place.title()}"
        except Exception as e:
            return False, f"Metadata validation error: {e}"

    report_path = Path("assets/clip_source_report.json")
    if report_path.exists():
        try:
            report = json.loads(report_path.read_text(encoding="utf-8"))
            for index, item in enumerate(report):
                source = item.get("source", "")
                dest = str(item.get("destination", "")).lower()
                source_path = str(item.get("source_path", "")).lower()
                keywords = PLACE_CLIP_KEYWORDS.get(expected_place, {expected_place})

                if dest and dest != expected_place:
                    return False, f"Clip source report beat {index+1} destination is {dest.title()}, expected {expected_place.title()}"
                if source == "fallback_graphic":
                    return False, f"Beat {index+1} used fallback graphic, which is not allowed for destination reels"
                if not any(k in source_path for k in keywords) and source != "pexels" and source != "pixabay":
                    return False, f"Clip source report beat {index+1} file ({source_path}) does not match destination {expected_place.title()}"
        except Exception as e:
            return False, f"Clip report validation error: {e}"

    return True, ""


def has_local_video_clips():
    for folder in [MANUAL_CLIPS_DIR, CLIP_LIBRARY_DIR, Path("inputs")]:
        if folder.exists() and any(folder.glob("*.mp4")):
            return True
    return False


def prompt_place(prompt):
    lower = prompt.lower()
    if "viet" in lower or "hanoi" in lower or "ha long" in lower or "halong" in lower:
        return "vietnam"
    if "bhutan" in lower or "paro" in lower or "thimphu" in lower or "punakha" in lower or "tiger's nest" in lower or "tigers nest" in lower:
        return "bhutan"
    if "thai" in lower or "phuket" in lower or "bangkok" in lower or "phi phi" in lower:
        return "thailand"
    for place in PLACE_CLIP_KEYWORDS:
        if place in lower:
            return place
    return ""


def local_clips_match_place(place):
    if not place:
        return True

    keywords = PLACE_CLIP_KEYWORDS.get(place, {place})
    names = []
    for folder in [MANUAL_CLIPS_DIR, CLIP_LIBRARY_DIR, Path("inputs")]:
        if folder.exists():
            names.extend(path.stem.lower().replace("_", " ") for path in folder.glob("*.mp4"))

    return any(
        any(keyword.replace("_", " ") in name for keyword in keywords)
        for name in names
    )


def local_video_clip_count():
    total = 0
    for folder in [MANUAL_CLIPS_DIR, CLIP_LIBRARY_DIR, Path("inputs")]:
        if folder.exists():
            total += len(list(folder.glob("*.mp4")))
    return total


def pexels_connection_available(timeout=3):
    try:
        with socket.create_connection(("api.pexels.com", 443), timeout=timeout):
            return True
    except OSError:
        return False


def pixabay_connection_available(timeout=3):
    try:
        with socket.create_connection(("pixabay.com", 443), timeout=timeout):
            return True
    except OSError:
        return False


def preflight_errors(has_local_clips, prompt=""):
    errors = []

    place = prompt_place(prompt)
    has_matching_local_place = local_clips_match_place(place)
    has_pexels_key = bool(os.getenv("PEXELS_API_KEY"))
    has_pixabay_key = bool(os.getenv("PIXABAY_API_KEY"))
    stock_reachable = (
        (has_pexels_key and pexels_connection_available(timeout=2))
        or (has_pixabay_key and pixabay_connection_available(timeout=2))
    )

    if place:
        if stock_reachable or has_matching_local_place:
            return errors

        if has_pexels_key or has_pixabay_key:
            errors.append(
                "Cloud download unavailable on this machine. "
                f"Your prompt is for {place.title()}, but no matching {place.title()} clips were found locally. "
                f"Add MP4 clips named like {place}_hotel.mp4, {place}_food.mp4, {place}_sunset.mp4, or run the app in cloud with working stock access."
            )
            return errors

        errors.append(
            f"Your prompt is for {place.title()}, but no matching {place.title()} clips were found. "
            "Add a PEXELS_API_KEY or PIXABAY_API_KEY in cloud secrets, or upload matching MP4 clips."
        )
        return errors

    if has_local_clips:
        return errors

    if not has_pexels_key and not has_pixabay_key:
        errors.append("Upload MP4 clips first, or add PEXELS_API_KEY or PIXABAY_API_KEY for automatic stock clips.")
    elif not stock_reachable:
        errors.append("Cloud download unavailable on this machine. Upload matching MP4 clips or run the app in cloud.")

    return errors


def video_length_from_prompt(prompt, default_length):
    match = re.search(r"\b(22|30|35|45)\s*(?:second|seconds|sec|s)\b", prompt, flags=re.IGNORECASE)
    if match:
        return int(match.group(1))
    return default_length


def effective_style_for_prompt(prompt, selected_style):
    lower = prompt.lower()
    if any(term in lower for term in TRAVEL_DETECTION_TERMS):
        return "Luxury Travel"
    return selected_style


def apply_selected_preset():
    preset_name = st.session_state.get("workflow_preset", "Divine Panchang Daily Avatar")
    config = PRESET_CONFIGS.get(preset_name, PRESET_CONFIGS["Divine Panchang Daily Avatar"])
    st.session_state["story_prompt"] = config["story_prompt"]
    st.session_state["style_choice"] = config["style"]
    st.session_state["video_length_choice"] = config["video_length"]
    st.session_state["youtube_metadata_prompt"] = config["metadata_prompt"]


if "workflow_preset" not in st.session_state:
    st.session_state["workflow_preset"] = "Divine Panchang Daily Avatar"
if "story_prompt" not in st.session_state:
    st.session_state["story_prompt"] = PRESET_CONFIGS["Divine Panchang Daily Avatar"]["story_prompt"]
if "style_choice" not in st.session_state:
    st.session_state["style_choice"] = PRESET_CONFIGS["Divine Panchang Daily Avatar"]["style"]
if "video_length_choice" not in st.session_state:
    st.session_state["video_length_choice"] = PRESET_CONFIGS["Divine Panchang Daily Avatar"]["video_length"]
if "youtube_metadata_prompt" not in st.session_state:
    st.session_state["youtube_metadata_prompt"] = PRESET_CONFIGS["Divine Panchang Daily Avatar"]["metadata_prompt"]


st.set_page_config(
    page_title="AI Avatar Reel Studio",
    page_icon="🎬",
    layout="wide",
)

st.markdown(
    """
    <style>
    .stApp {
        background:
            radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(236,72,153,0.14), transparent 32%),
            #050816;
        color: white;
    }

    .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
        max-width: 1220px;
    }

    .hero {
        min-height: 230px;
        border-radius: 24px;
        padding: 48px;
        background:
            linear-gradient(135deg, rgba(15,23,42,0.96), rgba(12,74,110,0.72)),
            url("https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg");
        background-size: cover;
        background-position: center;
        box-shadow: 0 24px 80px rgba(0,0,0,0.42);
        margin-bottom: 34px;
    }

    .hero h1 {
        color: white;
        font-size: 58px;
        line-height: 1.02;
        margin: 0 0 12px 0;
        font-weight: 850;
        letter-spacing: 0;
    }

    .hero p {
        color: rgba(255,255,255,0.82);
        font-size: 20px;
        max-width: 680px;
        margin: 0;
    }

    .section-title {
        font-size: 28px;
        font-weight: 800;
        color: white;
        margin-bottom: 14px;
    }

    .hint {
        color: #9ca3af;
        font-size: 14px;
        margin-bottom: 16px;
    }

    .stTextArea textarea,
    .stSelectbox div[data-baseweb="select"] > div {
        border-radius: 12px;
        border: 1px solid rgba(148,163,184,0.35);
    }

    .stButton button {
        width: 100%;
        height: 58px;
        border-radius: 14px;
        border: none;
        background: linear-gradient(90deg, #7c3aed, #06b6d4);
        color: white;
        font-size: 18px;
        font-weight: 800;
        box-shadow: 0 14px 34px rgba(6,182,212,0.24);
    }

    .status-card {
        border: 1px solid rgba(148,163,184,0.20);
        background: rgba(15,23,42,0.58);
        border-radius: 18px;
        padding: 18px;
        margin-top: 18px;
    }

        .stVideo {
        max-width: 360px;
        margin: auto;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 26px 70px rgba(0,0,0,0.55);
    }

    video {
        border-radius: 18px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="hero">
        <h1>AI Avatar Reel Studio</h1>
        <p>Start from a proven content preset or write your own brief. The app turns it into voice lines, matching clips, captions, music, and a vertical reel for travel, astrology, and daily guidance content.</p>
    </div>
    """,
    unsafe_allow_html=True,
)

# ── Reel Mode Tabs ──────────────────────────────────────────
reel_mode = st.radio(
    "Reel Mode",
    ["🎬 Travel & Content Reel", "🪐 Navagraha Spiritual Reel"],
    horizontal=True,
    label_visibility="collapsed",
    key="reel_mode",
)
st.markdown("<div style='margin-bottom:18px'></div>", unsafe_allow_html=True)

left, right = st.columns([1.05, 0.95], gap="large")

with left:
    st.markdown("<div class='section-title'>Story Brief</div>", unsafe_allow_html=True)
    # ── Navagraha Mode UI ─────────────────────────────────────
    if reel_mode == "🪐 Navagraha Spiritual Reel":
        st.markdown(
            "<div class='hint'>Select a planet. The app auto-generates a full 30-second cinematic spiritual story reel — character image, changing backgrounds, voice, captions, and music. No prompt needed.</div>",
            unsafe_allow_html=True,
        )
        planet_options = {v: k for k, v in NAVAGRAHA_LABELS.items()} if NAVAGRAHA_LABELS else {}
        selected_planet_label = st.selectbox(
            "Select Planet / Graha",
            options=list(planet_options.keys()) if planet_options else ["⚫ Shani (Saturn)"],
            key="selected_planet_label",
        )
        selected_planet_key = planet_options.get(selected_planet_label, "shani")
        st.session_state["selected_planet_key"] = selected_planet_key

        if NAVAGRAHA_PLANETS and selected_planet_key in NAVAGRAHA_PLANETS:
            p = NAVAGRAHA_PLANETS[selected_planet_key]
            st.info(
                f"**{p['name']}** — Voice: {p['voice_style'].split('-')[-1]}  \n"
                f"Story: {len(p['story'])} scenes · Unique backgrounds · Custom voice tone"
            )

        char_path = Path(NAVAGRAHA_PLANETS.get(selected_planet_key, {}).get("character_image", "")) if NAVAGRAHA_PLANETS else Path("")
        if char_path.exists():
            st.image(str(char_path), width=140, caption=f"{selected_planet_label} character")
        else:
            st.caption(f"ℹ️ Add character image at: `{char_path}` for best results.")

    # ── Standard Travel/Content Mode UI ───────────────────────
    else:
        st.markdown(
            "<div class='hint'>Describe exactly what the reel should say and show. Mention mood, audience, offer, call to action, and any timing details like date, festival, tithi, sign, or topic.</div>",
            unsafe_allow_html=True,
        )

        st.selectbox(
            "Workflow preset",
            options=list(PRESET_CONFIGS.keys()),
            key="workflow_preset",
            on_change=apply_selected_preset,
            help="Use a preset to load a working brief, tone, duration, and metadata direction.",
        )

    story_prompt = st.text_area(
        "Reel story / script prompt",
        key="story_prompt",
        height=170,
        label_visibility="collapsed",
    )

    style = st.selectbox(
        "Choose Style",
        STYLE_OPTIONS,
        key="style_choice",
    )

    video_length = st.select_slider(
        "Video length",
        options=[22, 30, 35, 45],
        key="video_length_choice",
        help="Use 30-35 seconds for a smoother story reel. 22 seconds is best only for very short clips.",
    )

    uploaded_logo = st.file_uploader(
        "Upload your PNG logo",
        type=["png"],
        help="Your logo appears on the generated reel intro and CTA overlays.",
    )

    if uploaded_logo is not None:
        st.image(uploaded_logo, width=170)
    elif LOGO_PATH.exists():
        st.image(str(LOGO_PATH), width=170)
        st.caption("Current logo will be used.")

    uploaded_clips = st.file_uploader(
        "Upload clips for this reel",
        type=["mp4"],
        accept_multiple_files=True,
        help="Use vertical MP4 clips. Rename files with destination and scene words like vietnam_halong_bay.mp4, thailand_phuket_resort.mp4, or japan_mount_fuji.mp4.",
    )

    if uploaded_clips:
        st.caption(f"{len(uploaded_clips)} custom clip(s) selected. Matching uploaded clips get first priority for this render.")
    elif any(MANUAL_CLIPS_DIR.glob("*.mp4")) or any(CLIP_LIBRARY_DIR.glob("*.mp4")):
        st.caption("Existing local clips are available as a backup when their filenames match the destination.")

    st.info(
        "This version uses strict destination matching: uploaded matching clips first, then Pexels, then Pixabay, then matching local library clips. "
        "Wrong-destination clips are blocked instead of reused.",
    )

    with st.expander("System status"):
        clip_count = local_video_clip_count()
        has_pexels_key = bool(os.getenv("PEXELS_API_KEY"))
        has_pixabay_key = bool(os.getenv("PIXABAY_API_KEY"))
        pexels_reachable = pexels_connection_available(timeout=2) if has_pexels_key else False
        pixabay_reachable = pixabay_connection_available(timeout=2) if has_pixabay_key else False

        if clip_count:
            st.success(f"Local clip library ready: {clip_count} MP4 clip(s) found.")
        else:
            st.warning("No local MP4 clips found yet.")

        if has_pexels_key and pexels_reachable:
            st.success("Pexels auto-download is reachable from this computer.")
        elif has_pexels_key:
            st.warning("Pexels key is loaded, but this computer is blocking Pexels downloads.")
        else:
            st.warning("No Pexels key loaded.")

        if has_pixabay_key and pixabay_reachable:
            st.success("Pixabay backup auto-download is reachable from this computer.")
        elif has_pixabay_key:
            st.warning("Pixabay key is loaded, but this computer may be blocking Pixabay downloads.")
        else:
            st.info("No Pixabay backup key loaded.")

        st.caption("Long-term best setup: run this app in the cloud and keep local clip upload as a backup.")

    with st.expander("Advanced YouTube metadata overrides"):
        st.markdown(
            "<div class='hint'>Leave these blank. The app will generate title, description, hashtags, and tags from your reel prompt and story beats.</div>",
            unsafe_allow_html=True,
        )
        youtube_metadata_prompt = st.text_area(
            "Optional metadata direction",
            key="youtube_metadata_prompt",
            placeholder="Example: Make it searchable for panchang, horoscope, and jyotish terms, with a grounded follow CTA.",
            height=80,
        )
        youtube_title = st.text_input(
            "Optional exact title",
            placeholder="Leave blank to auto-generate",
        )
        youtube_description = st.text_area(
            "Optional exact description",
            placeholder="Leave blank to auto-generate",
            height=120,
        )
        youtube_hashtags = st.text_input(
            "Optional exact hashtags",
            placeholder="Leave blank to auto-generate",
        )

    generate = st.button("Generate Viral 9:16 Reel")

with right:
    st.markdown("<div class='section-title'>Preview</div>", unsafe_allow_html=True)
    preview_box = st.container()

if "last_video_path" not in st.session_state:
    st.session_state["last_video_path"] = None


if generate:
    st.session_state["last_video_path"] = None
    render_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    st.session_state["render_id"] = render_id

    try:
        LATEST_VIDEO_PATH.unlink()
    except OSError:
        pass

    # ── NAVAGRAHA SPIRITUAL REEL PATH ────────────────────────────
    if st.session_state.get("reel_mode") == "🪐 Navagraha Spiritual Reel":
        planet_key = st.session_state.get("selected_planet_key", "shani")
        planet_name = NAVAGRAHA_PLANETS.get(planet_key, {}).get("name", planet_key.title()) if NAVAGRAHA_PLANETS else planet_key.title()
        progress = st.progress(0)
        status = st.empty()
        status.text(f"Generating {planet_name} spiritual reel...")
        progress.progress(20)

        result = subprocess.run(
            [sys.executable, "spiritual_story_reel.py", "--planet", planet_key],
            capture_output=True,
            text=True,
            timeout=600,
        )

        with st.expander("Render Logs"):
            st.text(result.stdout)
            st.text(result.stderr)

        if result.returncode == 0:
            out_path = Path(f"output/spiritual_{planet_key}_reel.mp4")
            if out_path.exists():
                st.session_state["last_video_path"] = str(out_path)
                status.success(f"{planet_name} reel generated successfully!")
                progress.progress(100)
            else:
                st.error("Render finished but output file not found.")
        else:
            st.error(f"Render failed. Check logs above.")
        st.stop()

    # ── STANDARD TRAVEL/CONTENT REEL PATH ───────────────────────
    clear_render_artifacts(render_id)
    with open("render_id.txt", "w", encoding="utf-8") as f:
        f.write(render_id)

    if st.session_state.get("story_prompt", "").strip() == "":
        st.error("Please enter a story prompt.")
    else:
        save_uploaded_logo(uploaded_logo)
        if uploaded_clips:
            save_uploaded_clips(uploaded_clips)

        save_youtube_overrides(
            youtube_metadata_prompt,
            youtube_title,
            youtube_description,
            youtube_hashtags,
        )

        errors = preflight_errors(has_local_video_clips(), story_prompt)
        if errors:
            for error in errors:
                st.error(error)
            st.stop()

        with open("topic.txt", "w", encoding="utf-8") as f:
            f.write(story_prompt.strip())

        effective_style = effective_style_for_prompt(story_prompt, style)
        with open("style.txt", "w", encoding="utf-8") as f:
            f.write(effective_style)

        final_video_length = video_length_from_prompt(story_prompt, video_length)
        with open("video_length.txt", "w", encoding="utf-8") as f:
            f.write(str(final_video_length))

        with open("avatar_hook_enabled.txt", "w", encoding="utf-8") as f:
            f.write("0")

        progress = st.progress(0)
        status = st.empty()
        logs = []

        try:
            os.remove("assets/talking_avatar.mp4")
        except OSError:
            pass

        steps = [
            ("Generating story beats from your brief...", "story_generator.py", 12),
            ("Writing YouTube title, description, and hashtags...", "youtube_metadata_generator.py", 18),
            ("Generating voiceover...", "voice_generator.py", 30),
            ("Downloading matching story clips...", "clip_downloader.py", 50),
            ("Finding background music...", "music_api_downloader.py", 64),
            ("Editing vertical viral reel...", "video_editor.py", 88),
        ]

        failed = False

        for label, script, percent in steps:
            status.text(label)
            progress.progress(percent)

            result = subprocess.run(
                [sys.executable, script],
                capture_output=True,
                text=True,
                timeout=1800,
            )

            logs.append(f"\n--- {script} ---\n")
            logs.append(result.stdout)
            logs.append(result.stderr)

            if result.returncode != 0:
                failed = True
                st.error(f"{script} failed. Open Render Logs below.")
                break

        with st.expander("Render Logs"):
            st.text("\n".join(logs))

        # Destination Validation
        expected_place = prompt_place(story_prompt)
        if not failed and expected_place:
            valid, val_err = validate_destination_alignment(expected_place)
            if not valid:
                failed = True
                st.error(f"Destination Validation Failed: {val_err}")

        latest_video = latest_rendered_video()

        if not failed and latest_video and os.path.exists(latest_video):
            st.session_state["last_video_path"] = latest_video
            status.success(f"Reel generated successfully (Render ID: {render_id}).")
            progress.progress(100)

        elif not failed:
            st.error("Video generation finished, but the new timestamped reel was not found.")


# ---------- Persistent preview ----------

last_video_path = st.session_state.get("last_video_path")

if last_video_path and os.path.exists(last_video_path):
    with preview_box:
        filename = os.path.basename(last_video_path)
        extracted_id = ""
        if "_reel_" in filename:
            extracted_id = filename.split("_reel_")[-1].replace(".mp4", "")
        if extracted_id:
            st.info(f"Previewing Reel (Render ID: {extracted_id})")
        st.video(last_video_path, start_time=0)

        with open(last_video_path, "rb") as file:
            st.download_button(
                label="Download Reel",
                data=file,
                file_name="viral_reel.mp4",
                mime="video/mp4",
                key="persistent_download_reel",
            )

        metadata = load_youtube_metadata()
        clip_report = load_clip_source_report()
        if clip_report:
            sources = [item.get("source", "") for item in clip_report]
            if "fallback_graphic" in sources and not any(source in sources for source in ["uploaded", "local_library", "pexels", "pixabay"]):
                st.warning(
                    "This render used local graphic placeholders because no local clips were uploaded and Pexels is blocked.",
                )
            elif "uploaded" in sources:
                st.success("This render used your uploaded matching clips.")
            elif any(source.startswith("local_library") for source in sources):
                st.success("This render used your uploaded/local clips.")
            elif "pexels" in sources or "pixabay" in sources:
                st.success("This render used stock footage.")

            st.markdown("<div class='section-title'>Clip Source Report</div>", unsafe_allow_html=True)
            report_rows = []
            for item in clip_report:
                source = str(item.get("source", "")).replace("_", " ").title()
                selected = item.get("selected_query") or item.get("scene") or ""
                location = item.get("source_path") or item.get("page_url") or item.get("download_url") or item.get("output_path") or ""
                report_rows.append({
                    "Beat": item.get("beat", ""),
                    "Destination": str(item.get("destination", "")).title(),
                    "Scene": selected,
                    "Source": source,
                    "Match": item.get("match_score", ""),
                    "File or URL": location,
                })
            st.dataframe(report_rows, use_container_width=True, hide_index=True)

        if metadata:
            st.markdown("<div class='section-title'>YouTube Upload Details</div>", unsafe_allow_html=True)
            st.text_input("Generated title", value=metadata.get("title", ""), key="generated_youtube_title")
            st.text_area(
                "Generated description",
                value=metadata.get("description", ""),
                height=180,
                key="generated_youtube_description",
            )
            st.text_input(
                "Generated hashtags",
                value=" ".join(metadata.get("hashtags", [])),
                key="generated_youtube_hashtags",
            )

            privacy_status = st.selectbox(
                "YouTube privacy",
                ["private", "unlisted", "public"],
                index=0,
                key="youtube_privacy_status",
            )

            if st.button("Upload to YouTube", key="upload_to_youtube"):
                upload_status = st.empty()
                upload_status.text("Starting YouTube upload...")
                result = subprocess.run(
                    [
                        sys.executable,
                        "youtube_uploader.py",
                        "--video",
                        last_video_path,
                        "--metadata",
                        str(YOUTUBE_METADATA_PATH),
                        "--privacy",
                        privacy_status,
                    ],
                    capture_output=True,
                    text=True,
                    timeout=3600,
                )

                with st.expander("YouTube Upload Logs", expanded=result.returncode != 0):
                    st.text(result.stdout)
                    st.text(result.stderr)

                if result.returncode == 0:
                    upload_status.text("YouTube upload complete.")
                    lines = [line.strip() for line in result.stdout.splitlines() if line.strip()]
                    url = next((line for line in lines if line.startswith("https://")), "")
                    if url:
                        st.success(f"Uploaded: {url}")
                else:
                    upload_status.text("YouTube upload failed. Open upload logs.")

            st.markdown("<div class='section-title'>Instagram Upload</div>", unsafe_allow_html=True)
            instagram_ready = bool(os.getenv("INSTAGRAM_ACCESS_TOKEN")) and bool(os.getenv("INSTAGRAM_USER_ID"))
            cloudinary_ready = all(
                os.getenv(key)
                for key in ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]
            )

            if instagram_ready:
                st.success("Instagram token is loaded.")
            else:
                st.warning("Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID before uploading to Instagram.")

            if not cloudinary_ready:
                st.info(
                    "Instagram needs a public HTTPS video URL. Paste one below, or add Cloudinary keys so the app can host the reel automatically."
                )

            instagram_video_url = st.text_input(
                "Optional public video URL for Instagram",
                placeholder="https://.../your-reel.mp4",
                key="instagram_video_url",
            )

            if st.button("Upload to Instagram Reel", key="upload_to_instagram"):
                upload_status = st.empty()
                upload_status.text("Starting Instagram upload...")

                command = [
                    sys.executable,
                    "instagram_uploader.py",
                    "--video",
                    last_video_path,
                    "--metadata",
                    str(YOUTUBE_METADATA_PATH),
                ]
                if instagram_video_url.strip():
                    command.extend(["--video-url", instagram_video_url.strip()])

                result = subprocess.run(
                    command,
                    capture_output=True,
                    text=True,
                    timeout=3600,
                )

                with st.expander("Instagram Upload Logs", expanded=result.returncode != 0):
                    token = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
                    safe_stdout = result.stdout.replace(token, "[hidden]") if token else result.stdout
                    safe_stderr = result.stderr.replace(token, "[hidden]") if token else result.stderr
                    st.text(safe_stdout)
                    st.text(safe_stderr)

                if result.returncode == 0:
                    upload_status.text("Instagram upload complete.")
                    st.success("Instagram Reel published.")
                else:
                    upload_status.text("Instagram upload failed. Open upload logs.")
