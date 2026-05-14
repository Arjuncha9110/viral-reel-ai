import requests
import os

PEXELS_API_KEY = "r6y9kH5m2WUUCYnkpV2h48pmCbWS7nSvfdhYazR1ByF46lDPf7zXrXnp"

headers = {
    "Authorization": PEXELS_API_KEY
}

topic = open("topic.txt", "r", encoding="utf-8").read()

search_terms = [
    topic,
    f"{topic} luxury",
    f"{topic} travel",
    f"{topic} cinematic",
    f"{topic} drone",
    f"{topic} lifestyle",
    f"{topic} resort",
    f"{topic} sunset"
]
os.makedirs("assets", exist_ok=True)

clip_number = 1

for term in search_terms:

    url = f"https://api.pexels.com/videos/search?query={term}&per_page=1"

    response = requests.get(url, headers=headers)
    data = response.json()

    if "videos" in data and len(data["videos"]) > 0:

        video_files = data["videos"][0]["video_files"]

        video_url = video_files[0]["link"]

        print(f"Downloading: {term}")

        video_data = requests.get(video_url).content

        with open(f"assets/clip{clip_number}.mp4", "wb") as f:
            f.write(video_data)

        clip_number += 1

print("All clips downloaded successfully.")