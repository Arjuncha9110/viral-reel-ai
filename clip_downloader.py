import requests
import os
import random

# ---------- PEXELS API ----------

API_KEY = "r6y9kH5m2WUUCYnkpV2h48pmCbWS7nSvfdhYazR1ByF46lDPf7zXrXnp"

HEADERS = {
    "Authorization": API_KEY
}

# ---------- READ TOPIC ----------

with open("topic.txt", "r", encoding="utf-8") as f:
    topic = f.read().strip()

# ---------- SEARCH TERMS ----------

if "turkey" in topic.lower():

    search_terms = [
        "Turkey cinematic",
        "Istanbul luxury",
        "Turkey resort",
        "Turkey aesthetic",
        "Cappadocia cinematic",
        "Turkey sunset",
        "Turkey luxury hotel",
        "Turkey nightlife"
    ]

elif "bali" in topic.lower():

    search_terms = [
        "Bali cinematic",
        "Bali luxury villa",
        "Bali resort",
        "Bali sunset",
        "Bali tropical",
        "Bali aesthetic",
        "Bali beach club",
        "Bali luxury hotel"
    ]

elif "dubai" in topic.lower():

    search_terms = [
        "Dubai luxury",
        "Dubai cinematic",
        "Dubai skyline",
        "Dubai yacht",
        "Dubai luxury hotel",
        "Dubai nightlife",
        "Dubai aesthetic",
        "Dubai resort"
    ]

elif "tokyo" in topic.lower():

    search_terms = [
        "Tokyo cinematic",
        "Tokyo nightlife",
        "Tokyo neon",
        "Tokyo luxury",
        "Tokyo city lights",
        "Tokyo aesthetic",
        "Tokyo skyline",
        "Tokyo streets"
    ]

elif "maldives" in topic.lower():

    search_terms = [
        "Maldives cinematic",
        "Maldives luxury villa",
        "Maldives resort",
        "Maldives beach",
        "Maldives aerial",
        "Maldives sunset",
        "Maldives tropical",
        "Maldives yacht"
    ]

else:

    search_terms = [
        f"{topic} cinematic",
        f"{topic} luxury",
        f"{topic} aesthetic",
        f"{topic} resort",
        f"{topic} travel",
        f"{topic} nightlife",
        f"{topic} skyline",
        f"{topic} vacation"
    ]

# ---------- CREATE ASSETS ----------

os.makedirs("assets", exist_ok=True)

# ---------- DELETE OLD CLIPS ----------

for file in os.listdir("assets"):

    if file.startswith("clip") and file.endswith(".mp4"):

        try:
            os.remove(os.path.join("assets", file))
        except:
            pass

# ---------- SETTINGS ----------

MAX_CLIPS = 12

used_video_ids = set()

clip_number = 1

# ---------- DOWNLOAD LOOP ----------

for term in search_terms:

    if clip_number > MAX_CLIPS:
        break

    print(f"\n🔍 Searching: {term}")

    try:

        url = (
            f"https://api.pexels.com/videos/search"
            f"?query={term}&per_page=10"
        )

        response = requests.get(
            url,
            headers=HEADERS
        )

        data = response.json()

        videos = data.get("videos", [])

        if len(videos) == 0:

            print("❌ No videos found")
            continue

        # ---------- RANDOMIZE ----------

        random.shuffle(videos)

        # ---------- PROCESS VIDEOS ----------

        for video in videos:

            if clip_number > MAX_CLIPS:
                break

            try:

                # ---------- UNIQUE VIDEOS ----------

                video_id = video["id"]

                if video_id in used_video_ids:
                    continue

                used_video_ids.add(video_id)

                # ---------- FILTER SHORT VIDEOS ----------

                if video["duration"] < 5:
                    continue

                video_files = video.get(
                    "video_files",
                    []
                )

                if len(video_files) == 0:
                    continue

                best_video = None

                # ---------- FIND BEST QUALITY ----------

                for vf in video_files:

                    width = vf.get("width", 0)
                    height = vf.get("height", 0)

                    # Prefer HD clips
                    if width >= 1080:

                        best_video = vf
                        break

                if best_video is None:
                    continue

                video_url = best_video["link"]

                print(f"⬇️ Downloading clip {clip_number}")

                video_data = requests.get(
                    video_url,
                    timeout=30
                ).content

                save_path = (
                    f"assets/clip{clip_number}.mp4"
                )

                with open(save_path, "wb") as f:
                    f.write(video_data)

                # ---------- VERIFY FILE ----------

                if os.path.getsize(save_path) > 500000:

                    print(f"✅ Saved {save_path}")

                    clip_number += 1

                else:

                    print("❌ Bad clip removed")

                    os.remove(save_path)

            except Exception as e:

                print("❌ Clip failed")

                print(e)

    except Exception as e:

        print("❌ Search failed")

        print(e)

print(
    f"\n✅ Downloaded {clip_number - 1} cinematic clips successfully."
)