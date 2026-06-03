import json
import os
import random
import shutil
from pathlib import Path

import requests


OUTPUT = Path("assets/music.mp3")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

LOCAL_FALLBACKS = [
    Path("music/tropical.mp3"),
    Path("music/luxury.mp3"),
    Path("music/cinematic.mp3"),
    Path("music/phonk.mp3"),
]


def read_style():
    try:
        return Path("style.txt").read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        return "Luxury Travel"


def pick_query(style):
    style = style.lower()

    if "finance" in style or "stock" in style or "trading" in style:
        return random.choice(["cinematic corporate", "dark electronic", "motivational beat"])

    if "dark" in style:
        return random.choice(["dark cinematic", "deep house", "cinematic tension"])

    if "motivation" in style:
        return random.choice(["motivational", "uplifting cinematic", "inspiring beat"])

    return random.choice(["travel vlog", "tropical house", "summer upbeat", "luxury lifestyle"])


def find_download_url(value):
    if isinstance(value, dict):
        preferred_keys = [
            "download_url",
            "downloadUrl",
            "audio_url",
            "audioUrl",
            "mp3",
            "url",
            "src",
        ]

        for key in preferred_keys:
            item = value.get(key)
            if isinstance(item, str) and item.startswith("http"):
                return item

        for item in value.values():
            found = find_download_url(item)
            if found:
                return found

    elif isinstance(value, list):
        for item in value:
            found = find_download_url(item)
            if found:
                return found

    return None


def extract_tracks(data):
    if isinstance(data, list):
        return data

    if not isinstance(data, dict):
        return []

    for key in ["data", "tracks", "results", "items"]:
        value = data.get(key)
        if isinstance(value, list):
            return value

        if isinstance(value, dict):
            nested = extract_tracks(value)
            if nested:
                return nested

    return []


def request_json(url, query):
    response = requests.get(
        url,
        params={
            "query": query,
            "q": query,
            "search": query,
            "limit": 10,
        },
        timeout=30,
        headers={"Accept": "application/json"},
    )

    response.raise_for_status()
    return response.json()


def search_free_to_use(query):
    endpoints = [
        "https://api.freetouse.com/music/tracks/search",
        "https://api.freetouse.com/api/music/tracks/search",
        "https://freetouse.com/api/music/tracks/search",
        "https://www.freetouse.com/api/music/tracks/search",
        "https://api.freetouse.com/music/tracks",
        "https://api.freetouse.com/api/music/tracks",
    ]

    last_error = None

    for endpoint in endpoints:
        try:
            print(f"Trying music endpoint: {endpoint}")
            data = request_json(endpoint, query)
            tracks = extract_tracks(data)

            if not tracks:
                continue

            random.shuffle(tracks)

            for track in tracks:
                download_url = find_download_url(track)

                if download_url:
                    title = track.get("title") or track.get("name") or "unknown track"
                    artist = track.get("artist") or track.get("artist_name") or track.get("author") or "unknown artist"
                    return download_url, title, artist

        except Exception as e:
            last_error = e
            print(f"Music endpoint failed: {e}")

    raise RuntimeError(f"No downloadable music found from API. Last error: {last_error}")


def download_file(url):
    with requests.get(url, stream=True, timeout=120) as response:
        response.raise_for_status()

        with open(OUTPUT, "wb") as file:
            for chunk in response.iter_content(chunk_size=1024 * 256):
                if chunk:
                    file.write(chunk)


def use_local_fallback(reason):
    for path in LOCAL_FALLBACKS:
        if path.exists():
            shutil.copy2(path, OUTPUT)
            metadata = {
                "source": "local fallback",
                "file": str(path),
                "reason": str(reason),
            }
            Path("assets/music_source.json").write_text(
                json.dumps(metadata, indent=4),
                encoding="utf-8",
            )
            print(f"Using local music fallback: {path}")
            print(f"Saved to: {OUTPUT}")
            return

    print("No API music and no local fallback music found. Continuing without background music.")


def main():
    style = read_style()
    query = pick_query(style)

    print(f"Searching free music API: {query}")

    try:
        url, title, artist = search_free_to_use(query)
        download_file(url)

        metadata = {
            "source": "Free To Use",
            "query": query,
            "title": title,
            "artist": artist,
            "download_url": url,
        }

        Path("assets/music_source.json").write_text(
            json.dumps(metadata, indent=4),
            encoding="utf-8",
        )

        print(f"Music downloaded: {title} by {artist}")
        print(f"Saved to: {OUTPUT}")

    except Exception as e:
        print(f"Music API unavailable: {e}")
        use_local_fallback(e)


if __name__ == "__main__":
    main()
