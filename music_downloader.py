import requests
import os
import urllib.parse

# ---------- PIXABAY API ----------

API_KEY = "YOUR_PIXABAY_API_KEY"

# ---------- READ TOPIC ----------

with open(
    "topic.txt",
    "r",
    encoding="utf-8"
) as f:

    topic = f.read().strip()

# ---------- SMART MUSIC SEARCH ----------

topic_lower = topic.lower()

if "dubai" in topic_lower:
    music_query = "luxury cinematic"

elif "tokyo" in topic_lower:
    music_query = "cyberpunk"

elif "bali" in topic_lower or "beach" in topic_lower:
    music_query = "tropical chill"

elif "finance" in topic_lower or "stock" in topic_lower:
    music_query = "dark phonk"

else:
    music_query = "cinematic"

print(f"\nSearching music: {music_query}")

# ---------- URL ENCODE ----------

encoded_query = urllib.parse.quote(
    music_query
)

# ---------- API URL ----------

url = (
    f"https://pixabay.com/api/audio/"
    f"?key={API_KEY}"
    f"&q={encoded_query}"
    f"&per_page=3"
)

# ---------- REQUEST ----------

response = requests.get(url)

data = response.json()

# ---------- CHECK ----------

if "hits" not in data or len(data["hits"]) == 0:

    print("No music found.")
    exit()

# ---------- GET AUDIO URL ----------

music_url = (
    data["hits"][0]
    ["audio_files"]
    ["mp3"]["high"]
)

print("\nDownloading background music...")

# ---------- DOWNLOAD ----------

music_data = requests.get(
    music_url
).content

# ---------- SAVE ----------

os.makedirs(
    "assets",
    exist_ok=True
)

with open(
    "assets/music.mp3",
    "wb"
) as f:

    f.write(music_data)

print("\nMusic downloaded successfully.")