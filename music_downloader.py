import requests
import os

# Pixabay API Key
API_KEY = "55861194-e269cf7308c9c39ca1d9481e8"

# READ TOPIC
with open("topic.txt", "r", encoding="utf-8") as f:
    topic = f.read().strip()

# SMART MUSIC SEARCH
if "dubai" in topic.lower():
    music_query = "luxury cinematic"
elif "tokyo" in topic.lower():
    music_query = "cyberpunk electronic"
elif "beach" in topic.lower() or "bali" in topic.lower():
    music_query = "tropical chill"
else:
    music_query = "cinematic travel"

url = f"https://pixabay.com/api/audio/?key={API_KEY}&q={music_query}"

response = requests.get(url)
data = response.json()

if len(data["hits"]) == 0:
    print("No music found")
    exit()

music_url = data["hits"][0]["audio"]

print(f"Downloading music: {music_query}")

music_data = requests.get(music_url).content

os.makedirs("assets", exist_ok=True)

with open("assets/music.mp3", "wb") as f:
    f.write(music_data)

print("Music downloaded successfully.")