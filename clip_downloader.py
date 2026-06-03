import json
import os
import shutil
from datetime import datetime
from pathlib import Path

import numpy as np
import requests
from PIL import Image, ImageDraw
from moviepy.editor import ImageClip


def load_env_file(path):
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


load_env_file(".env")
load_env_file("api_keys.txt")

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")
PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY", "")

WIDTH = 1080
HEIGHT = 1920
def get_render_id():
    try:
        if os.path.exists("render_id.txt"):
            with open("render_id.txt", "r", encoding="utf-8") as f:
                rid = f.read().strip()
                if rid:
                    return rid
    except Exception:
        pass
    return datetime.now().strftime("%Y%m%d_%H%M%S")

RENDER_ID = get_render_id()
ASSETS_DIR = Path("assets")
MANUAL_CLIPS_DIR = ASSETS_DIR / "manual_clips"
CLIP_LIBRARY_DIR = ASSETS_DIR / "clip_library"
INPUTS_DIR = Path("inputs")
RUN_CLIPS_DIR = ASSETS_DIR / "render_clips" / RENDER_ID
CLIP_MANIFEST_PATH = ASSETS_DIR / "clip_manifest.json"
CLIP_REPORT_PATH = ASSETS_DIR / "clip_source_report.json"

ASSETS_DIR.mkdir(exist_ok=True)

clip_manifest = {}
clip_source_report = []
used_video_ids = set()
used_local_paths = set()
pexels_provider_available = bool(PEXELS_API_KEY)
pixabay_provider_available = bool(PIXABAY_API_KEY)

WEAK_MATCH_TOKENS = {
    "and",
    "before",
    "book",
    "cinematic",
    "city",
    "clip",
    "clips",
    "dreamy",
    "emotional",
    "every",
    "first",
    "hour",
    "hits",
    "hotel",
    "itinerary",
    "local",
    "luxury",
    "premium",
    "reel",
    "save",
    "scene",
    "scenic",
    "short",
    "street",
    "streets",
    "the",
    "this",
    "tour",
    "travel",
    "trip",
    "video",
    "view",
    "views",
    "viral",
    "with",
}

DESTINATION_ALIASES = {
    "japan": {
        "japan",
        "tokyo",
        "kyoto",
        "osaka",
        "fuji",
        "mount fuji",
        "shibuya",
        "sakura",
        "cherry blossom",
        "sushi",
        "bullet train",
        "shinkansen",
    },
    "bali": {
        "bali",
        "ubud",
        "canggu",
        "seminyak",
        "uluwatu",
        "kuta",
        "nusa penida",
        "rice terrace",
        "floating breakfast",
    },
    "dubai": {
        "dubai",
        "burj khalifa",
        "burj",
        "marina",
        "desert safari",
        "souk",
        "palm jumeirah",
        "yacht",
    },
    "maldives": {
        "maldives",
        "overwater",
        "lagoon",
        "island resort",
        "water villa",
        "reef",
    },
    "thailand": {
        "thailand",
        "thai",
        "phuket",
        "bangkok",
        "krabi",
        "chiang mai",
        "phi phi",
        "koh samui",
        "pattaya",
        "maya bay",
    },
    "vietnam": {
        "vietnam",
        "hanoi",
        "ha long",
        "halong",
        "ha long bay",
        "danang",
        "da nang",
        "hoi an",
        "saigon",
        "ho chi minh",
        "sapa",
        "mekong",
        "ninh binh",
        "phu quoc",
    },
    "bhutan": {
        "bhutan",
        "paro",
        "thimphu",
        "punakha",
        "tiger's nest",
        "tigers nest",
        "taktsang",
        "dzong",
        "prayer flags",
        "himalayan",
        "monastery",
    },
    "paris": {"paris", "eiffel", "louvre", "montmartre"},
    "singapore": {"singapore", "marina bay", "sentosa", "gardens by the bay"},
    "goa": {"goa", "anjuna", "baga", "palolem"},
}

TRAVEL_DESTINATIONS = set(DESTINATION_ALIASES)


def normalize_text(value):
    return " ".join(str(value or "").replace("_", " ").replace("-", " ").lower().split())


def tokenize(value):
    normalized = normalize_text(value)
    cleaned = "".join(ch if ch.isalnum() else " " for ch in normalized)
    return [
        part
        for part in cleaned.split()
        if len(part) > 2 and part not in WEAK_MATCH_TOKENS
    ]


def detect_destination(prompt_or_scene):
    if isinstance(prompt_or_scene, dict):
        explicit = normalize_text(prompt_or_scene.get("destination", ""))
        if explicit in TRAVEL_DESTINATIONS:
            return explicit
        text = " ".join(
            str(value)
            for value in [
                prompt_or_scene.get("query", ""),
                prompt_or_scene.get("scene", ""),
                prompt_or_scene.get("caption", ""),
                prompt_or_scene.get("beat", ""),
                " ".join(prompt_or_scene.get("queries", []) or []),
            ]
        )
    else:
        text = str(prompt_or_scene or "")

    normalized = f" {normalize_text(text)} "
    for destination, aliases in DESTINATION_ALIASES.items():
        for alias in sorted(aliases, key=len, reverse=True):
            alias_text = f" {normalize_text(alias)} "
            if alias_text in normalized:
                return destination

    return ""


def place_alias_tokens(destination):
    tokens = set()
    for alias in DESTINATION_ALIASES.get(destination, {destination}):
        tokens.update(tokenize(alias))
    return tokens


def scene_text(scene):
    return " ".join(
        [
            str(scene.get("query", "")),
            str(scene.get("scene", "")),
            str(scene.get("caption", "")),
            " ".join(scene.get("queries", []) or []),
        ]
    )


def scene_tokens(scene):
    return set(tokenize(scene_text(scene)))


def dedupe(values):
    seen = set()
    output = []
    for value in values:
        clean = " ".join(str(value or "").split())
        key = clean.lower()
        if clean and key not in seen:
            seen.add(key)
            output.append(clean)
    return output


def build_search_queries(scene):
    destination = detect_destination(scene)
    raw_queries = []
    raw_queries.extend(scene.get("queries", []) or [])
    if scene.get("query"):
        raw_queries.insert(0, scene.get("query", ""))
    if scene.get("caption"):
        raw_queries.append(scene.get("caption", ""))

    queries = []
    for query in raw_queries:
        clean = normalize_text(query)
        if not clean:
            continue
        query_destination = detect_destination(clean)
        if destination and query_destination and query_destination != destination:
            clean = f"{destination} {clean}"
        elif destination and destination not in clean and not query_destination:
            clean = f"{destination} {clean}"
        queries.append(clean)

    if destination:
        queries.append(f"{destination} travel vertical video")

    return dedupe(queries)[:5]


def local_clip_paths(folders):
    paths = []
    for folder in folders:
        folder = Path(folder)
        if not folder.is_dir():
            continue

        for path in sorted(folder.glob("*.mp4")):
            name = path.name.lower()
            if name.startswith(("bad_", "skip_", "disabled_")):
                continue
            if name.startswith(("avatar_", "talking_avatar")):
                continue
            paths.append(path)

    return paths


def is_generic_local_allowed():
    return bool(os.getenv("ALLOW_GENERIC_LOCAL_CLIPS", "").strip())


def local_clip_match_score(path, scene):
    destination = detect_destination(scene)
    source_destination = detect_destination(path.stem)
    name_tokens = set(tokenize(path.stem))
    tokens = scene_tokens(scene)
    destination_tokens = place_alias_tokens(destination) if destination else set()

    if destination:
        if source_destination and source_destination != destination:
            return -100
        if not source_destination and not name_tokens.intersection(destination_tokens):
            return -100

    score = 0
    overlap = name_tokens.intersection(tokens)
    score += len(overlap) * 12

    if destination and (source_destination == destination or name_tokens.intersection(destination_tokens)):
        score += 80

    scene_specific_overlap = [
        token for token in overlap
        if token not in WEAK_MATCH_TOKENS and token not in {"hotel", "resort", "market"}
    ]
    score += len(scene_specific_overlap) * 8

    if path not in used_local_paths:
        score += 10
    else:
        score -= 55

    if {"night", "street"}.intersection(name_tokens) and {"hotel", "resort", "villa"}.intersection(tokens):
        score -= 20
    if "station" in name_tokens and {"mount", "fuji", "sunrise", "landscape"}.intersection(tokens):
        score -= 10

    return score


def validate_clip_source(scene, candidate):
    destination = detect_destination(scene)
    if not candidate:
        return False, "missing candidate"

    source = candidate.get("source", "")
    if destination and source == "fallback_graphic":
        return False, "fallback graphics are disabled for destination travel reels"

    if source in {"uploaded", "local_library"}:
        source_path = Path(candidate.get("source_path", ""))
        source_destination = detect_destination(source_path.stem)
        if source_destination and source_destination != destination:
            return False, f"local clip looks like {source_destination}, not {destination}"
        if destination and not source_destination:
            destination_tokens = place_alias_tokens(destination)
            if not scene_tokens(scene).intersection(set(tokenize(source_path.stem))):
                return False, f"local clip name does not match {destination} or this scene"
            if not set(tokenize(source_path.stem)).intersection(destination_tokens) and not is_generic_local_allowed():
                return False, f"local clip name does not include {destination} keywords"

    return True, ""


def save_report_entry(scene, candidate, clip_number):
    entry = {
        "clip": clip_number,
        "beat": scene.get("beat", "story"),
        "destination": detect_destination(scene),
        "scene": scene.get("query") or (scene.get("queries", [""])[0] if scene.get("queries") else ""),
        "caption": scene.get("caption", ""),
        "queries": build_search_queries(scene),
        "selected_query": candidate.get("query", ""),
        "source": candidate.get("source", ""),
        "source_path": candidate.get("source_path", ""),
        "download_url": candidate.get("download_url", ""),
        "page_url": candidate.get("page_url", ""),
        "output_path": candidate.get("output_path", ""),
        "match_score": candidate.get("match_score", 0),
        "duration": scene.get("duration", 0),
    }
    clip_source_report.append(entry)


def copy_local_clip(path, scene, clip_number, source_label, match_score):
    RUN_CLIPS_DIR.mkdir(parents=True, exist_ok=True)
    save_path = RUN_CLIPS_DIR / f"clip{clip_number}.mp4"
    shutil.copy2(path, save_path)
    used_local_paths.add(path)
    candidate = {
        "source": source_label,
        "source_path": path.as_posix(),
        "output_path": save_path.as_posix(),
        "match_score": match_score,
    }
    valid, reason = validate_clip_source(scene, candidate)
    if not valid:
        save_path.unlink(missing_ok=True)
        print(f"Rejected local clip {path}: {reason}")
        return None
    print(f"Using {source_label} clip: {path} -> {save_path}")
    save_report_entry(scene, candidate, clip_number)
    return save_path


def find_matching_local_clip(scene, clip_number, folders=None, source_label="local_library"):
    folders = folders or [CLIP_LIBRARY_DIR, INPUTS_DIR]
    candidates = [
        (path, local_clip_match_score(path, scene))
        for path in local_clip_paths(folders)
        if path not in used_local_paths
    ]
    candidates = [candidate for candidate in candidates if candidate[1] >= 35]

    if not candidates:
        return None

    source_path, match_score = max(candidates, key=lambda candidate: candidate[1])
    return copy_local_clip(source_path, scene, clip_number, source_label, match_score)


def score_pexels_file(file, target_duration, video_duration=0):
    width = file.get("width") or 0
    height = file.get("height") or 0
    duration = video_duration or file.get("duration") or 0
    quality = 0

    if height > width:
        quality += 120
    if height >= 1920:
        quality += 55
    elif height >= 1280:
        quality += 30
    if width >= 1080:
        quality += 20
    if duration >= target_duration:
        quality += 30
    elif duration >= max(2, target_duration - 1):
        quality += 12

    return quality


def pixabay_video_files(video):
    files = []
    for rendition in (video.get("videos") or {}).values():
        if isinstance(rendition, dict) and rendition.get("url"):
            files.append(rendition)
    return files


def score_pixabay_file(file, target_duration, video_duration=0):
    width = file.get("width") or 0
    height = file.get("height") or 0
    duration = video_duration or 0
    size = file.get("size") or 0
    quality = 0

    if height > width:
        quality += 120
    if height >= 1920:
        quality += 60
    elif height >= 1280:
        quality += 35
    elif height >= 960:
        quality += 15
    if width >= 1080:
        quality += 25
    if duration >= target_duration:
        quality += 30
    elif duration >= max(2, target_duration - 1):
        quality += 12
    if size:
        quality += min(20, size / 1_000_000)

    return quality


def download_bytes(url):
    response = requests.get(url, timeout=120)
    response.raise_for_status()
    return response.content


def download_from_pexels(query, scene, clip_number, target_duration):
    global pexels_provider_available

    if not PEXELS_API_KEY or not pexels_provider_available:
        return None

    print(f"\nSearching Pexels: {query}")
    try:
        response = requests.get(
            "https://api.pexels.com/videos/search",
            headers={"Authorization": PEXELS_API_KEY},
            params={
                "query": query,
                "per_page": 12,
                "orientation": "portrait",
                "size": "large",
            },
            timeout=30,
        )
    except requests.RequestException as exc:
        pexels_provider_available = False
        print(f"Pexels connection failed: {exc}")
        return None

    if response.status_code in {401, 403}:
        print("Pexels API key was rejected. Disabling Pexels provider.")
        pexels_provider_available = False
        return None
    if response.status_code == 429:
        print("Pexels rate limit reached. Disabling Pexels provider.")
        pexels_provider_available = False
        return None
    if response.status_code != 200:
        print(f"Pexels request failed: {response.status_code} {response.text[:200]}")
        return None

    videos = response.json().get("videos", [])
    if not videos:
        print("No Pexels videos found.")
        return None

    videos = sorted(
        videos,
        key=lambda video: max(
            [score_pexels_file(file, target_duration, video.get("duration") or 0) for file in video.get("video_files", [])]
            or [0]
        ),
        reverse=True,
    )

    for video in videos:
        video_id = f"pexels:{video.get('id')}"
        if video_id in used_video_ids:
            continue

        files = sorted(
            video.get("video_files", []),
            key=lambda file: score_pexels_file(file, target_duration, video.get("duration") or 0),
            reverse=True,
        )
        if not files:
            continue

        video_url = files[0].get("link")
        if not video_url:
            continue

        try:
            RUN_CLIPS_DIR.mkdir(parents=True, exist_ok=True)
            save_path = RUN_CLIPS_DIR / f"clip{clip_number}.mp4"
            save_path.write_bytes(download_bytes(video_url))
            used_video_ids.add(video_id)
            candidate = {
                "source": "pexels",
                "query": query,
                "download_url": video_url,
                "page_url": video.get("url", ""),
                "output_path": save_path.as_posix(),
                "match_score": score_pexels_file(files[0], target_duration, video.get("duration") or 0),
            }
            save_report_entry(scene, candidate, clip_number)
            print(f"Saved {save_path}")
            return save_path
        except Exception as exc:
            print("Pexels download failed, trying next result.")
            print(exc)

    return None


def download_from_pixabay(query, scene, clip_number, target_duration):
    global pixabay_provider_available

    if not PIXABAY_API_KEY or not pixabay_provider_available:
        return None

    print(f"\nSearching Pixabay: {query}")
    try:
        response = requests.get(
            "https://pixabay.com/api/videos/",
            params={
                "key": PIXABAY_API_KEY,
                "q": query,
                "per_page": 12,
                "video_type": "film",
                "safesearch": "true",
                "order": "popular",
                "min_height": 720,
            },
            timeout=30,
        )
    except requests.RequestException as exc:
        pixabay_provider_available = False
        print(f"Pixabay connection failed: {exc}")
        return None

    if response.status_code in {401, 403}:
        print("Pixabay API key was rejected. Disabling Pixabay provider.")
        pixabay_provider_available = False
        return None
    if response.status_code == 429:
        print("Pixabay rate limit reached. Disabling Pixabay provider.")
        pixabay_provider_available = False
        return None
    if response.status_code != 200:
        print(f"Pixabay request failed: {response.status_code} {response.text[:200]}")
        return None

    videos = response.json().get("hits", [])
    if not videos:
        print("No Pixabay videos found.")
        return None

    videos = sorted(
        videos,
        key=lambda video: max(
            [score_pixabay_file(file, target_duration, video.get("duration") or 0) for file in pixabay_video_files(video)]
            or [0]
        ),
        reverse=True,
    )

    for video in videos:
        video_id = f"pixabay:{video.get('id')}"
        if video_id in used_video_ids:
            continue

        files = sorted(
            pixabay_video_files(video),
            key=lambda file: score_pixabay_file(file, target_duration, video.get("duration") or 0),
            reverse=True,
        )
        if not files:
            continue

        video_url = files[0].get("url")
        if not video_url:
            continue

        try:
            RUN_CLIPS_DIR.mkdir(parents=True, exist_ok=True)
            save_path = RUN_CLIPS_DIR / f"clip{clip_number}.mp4"
            save_path.write_bytes(download_bytes(video_url))
            used_video_ids.add(video_id)
            candidate = {
                "source": "pixabay",
                "query": query,
                "download_url": video_url,
                "page_url": video.get("pageURL", ""),
                "output_path": save_path.as_posix(),
                "match_score": score_pixabay_file(files[0], target_duration, video.get("duration") or 0),
            }
            save_report_entry(scene, candidate, clip_number)
            print(f"Saved {save_path}")
            return save_path
        except Exception as exc:
            print("Pixabay download failed, trying next result.")
            print(exc)

    return None


def wrap_text(text, max_chars=18):
    words = text.upper().split()
    lines = []
    current = []
    for word in words:
        candidate = " ".join(current + [word])
        if len(candidate) > max_chars and current:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return lines[:4]


def create_fallback_clip(scene, clip_number):
    query = (scene.get("queries") or [scene.get("query", "")])[0].lower()
    duration = max(2.0, min(float(scene.get("duration", 3.5)), 8.0))
    RUN_CLIPS_DIR.mkdir(parents=True, exist_ok=True)
    save_path = RUN_CLIPS_DIR / f"clip{clip_number}.mp4"

    img = Image.new("RGB", (WIDTH, HEIGHT), (7, 12, 24))
    draw = ImageDraw.Draw(img)
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        draw.line((0, y, WIDTH, y), fill=(int(8 + 24 * ratio), int(18 + 64 * ratio), int(38 + 112 * ratio)))
    draw.ellipse((WIDTH - 250, 140, WIDTH - 70, 320), fill=(255, 216, 105))

    if any(word in query for word in ["prayer", "panchang", "zodiac", "astrology", "candle", "meditation", "spiritual"]):
        draw.rounded_rectangle((170, 540, WIDTH - 170, 1320), radius=52, fill=(17, 24, 44), outline=(255, 216, 105), width=4)
        draw.ellipse((340, 640, 740, 1040), outline=(255, 216, 105), width=8)
        draw.ellipse((420, 720, 660, 960), outline=(255, 216, 105), width=6)
        for angle in range(0, 360, 30):
            x = int(540 + 250 * np.cos(np.radians(angle)))
            y = int(840 + 250 * np.sin(np.radians(angle)))
            draw.ellipse((x - 12, y - 12, x + 12, y + 12), fill=(255, 216, 105))
        draw.rectangle((0, 1360, WIDTH, 1382), fill=(255, 216, 105))
    else:
        for index in range(16):
            x1 = 32 + index * 68
            height = 170 + (index % 5) * 58
            y1 = 810 - height
            draw.rounded_rectangle(
                (x1, y1, x1 + 44, 810),
                radius=8,
                fill=(15, 31, 52),
                outline=(255, 216, 105),
                width=2,
            )
            for wy in range(y1 + 22, 790, 34):
                draw.rectangle((x1 + 12, wy, x1 + 32, wy + 8), fill=(255, 216, 105))
        draw.rectangle((0, 810, WIDTH, 826), fill=(255, 216, 105))

    lines = wrap_text(scene.get("caption") or scene.get("query") or "Story beat")
    y = 1120
    for line in lines:
        draw.text((WIDTH / 2, y), line, fill=(255, 216, 105), anchor="mm")
        y += 62

    ImageClip(np.array(img)).set_duration(duration).write_videofile(
        str(save_path),
        fps=24,
        codec="libx264",
        audio=False,
        preset="ultrafast",
        logger=None,
    )
    candidate = {
        "source": "fallback_graphic",
        "output_path": save_path.as_posix(),
        "match_score": 0,
    }
    save_report_entry(scene, candidate, clip_number)
    print(f"Saved local fallback clip: {save_path}")
    return save_path


def load_scenes():
    with open("scenes.json", "r", encoding="utf-8-sig") as file:
        raw_scenes = json.load(file)

    scenes = []
    for item in raw_scenes:
        if isinstance(item, dict):
            query = str(item.get("query", "")).strip()
            queries = item.get("queries", [])
            duration = item.get("duration", 4)
            scene = {
                "query": query,
                "queries": queries if isinstance(queries, list) else [queries],
                "duration": float(duration or 4),
                "beat": item.get("beat", "story"),
                "caption": item.get("caption", ""),
                "destination": normalize_text(item.get("destination", "")),
            }
        else:
            scene = {
                "query": str(item),
                "queries": [str(item)],
                "duration": 4.0,
                "beat": "story",
                "caption": "",
                "destination": "",
            }

        scene["queries"] = dedupe([scene["query"]] + [str(value) for value in scene["queries"]])
        if not scene["destination"]:
            scene["destination"] = detect_destination(scene)
        if scene["queries"]:
            scenes.append(scene)

    return scenes


def save_outputs():
    clip_manifest["_render_id"] = RENDER_ID
    CLIP_MANIFEST_PATH.write_text(json.dumps(clip_manifest, indent=4), encoding="utf-8")
    
    for entry in clip_source_report:
        entry["render_id"] = RENDER_ID
    CLIP_REPORT_PATH.write_text(json.dumps(clip_source_report, indent=4), encoding="utf-8")
    
    timestamped_manifest = ASSETS_DIR / f"clip_manifest_{RENDER_ID}.json"
    timestamped_report = ASSETS_DIR / f"clip_source_report_{RENDER_ID}.json"
    timestamped_manifest.write_text(json.dumps(clip_manifest, indent=4), encoding="utf-8")
    timestamped_report.write_text(json.dumps(clip_source_report, indent=4), encoding="utf-8")


def clip_failure_message(scene):
    destination = detect_destination(scene)
    query_text = ", ".join(build_search_queries(scene))
    if destination:
        return (
            f"Could not find a real matching {destination.title()} clip for this beat. "
            f"Queries tried: {query_text}. "
            f"Use cloud deployment with working Pexels/Pixabay keys, or add MP4 clips named like "
            f"{destination}_hotel.mp4, {destination}_food.mp4, {destination}_sunset.mp4."
        )
    return f"Could not find a real matching clip. Queries tried: {query_text}."


def main():
    RUN_CLIPS_DIR.mkdir(parents=True, exist_ok=True)
    scenes = load_scenes()
    if not scenes:
        raise RuntimeError("No scenes found. Generate story beats before downloading clips.")

    if not PEXELS_API_KEY and not PIXABAY_API_KEY and not local_clip_paths([MANUAL_CLIPS_DIR, CLIP_LIBRARY_DIR, INPUTS_DIR]):
        raise RuntimeError(
            "No clip source is available. Add PEXELS_API_KEY or PIXABAY_API_KEY, or upload matching MP4 clips."
        )

    for clip_number, scene in enumerate(scenes, start=1):
        target_duration = float(scene.get("duration", 4))
        save_path = None

        save_path = find_matching_local_clip(
            scene,
            clip_number,
            folders=[MANUAL_CLIPS_DIR],
            source_label="uploaded",
        )

        if save_path is None:
            for query in build_search_queries(scene):
                save_path = download_from_pexels(query, scene, clip_number, target_duration)
                if save_path:
                    break

        if save_path is None:
            for query in build_search_queries(scene):
                save_path = download_from_pixabay(query, scene, clip_number, target_duration)
                if save_path:
                    break

        if save_path is None:
            save_path = find_matching_local_clip(
                scene,
                clip_number,
                folders=[CLIP_LIBRARY_DIR, INPUTS_DIR],
                source_label="local_library",
            )

        if save_path is None:
            if detect_destination(scene) and not os.getenv("ALLOW_FALLBACK_GRAPHICS", "").strip():
                save_outputs()
                raise RuntimeError(clip_failure_message(scene))

            print("Could not download a usable clip. Creating local test clip.")
            save_path = create_fallback_clip(scene, clip_number)

        clip_manifest[str(clip_number)] = Path(save_path).as_posix()

    save_outputs()
    print("\nDownloaded story clips successfully.")


if __name__ == "__main__":
    main()
