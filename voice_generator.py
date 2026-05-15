import requests

API_KEY = "f614db18963a0bb7e13b9f017cfff461cd77e86a249e13d5f26d05917b6eb9b7"

VOICE_ID = "EXAVITQu4vr4xnSDxMaL"

# ---------- READ TOPIC ----------

with open(
    "topic.txt",
    "r",
    encoding="utf-8"
) as f:

    topic = f.read().strip()

print("TOPIC:", topic)

# ---------- DYNAMIC SCRIPT ----------

text = f"""
Welcome to {topic}.

Luxury experiences.
Beautiful destinations.
Cinematic views.

This place feels unreal.

DM now for exclusive travel packages.
"""

# ---------- API ----------

url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

headers = {
    "Accept": "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": API_KEY
}

data = {
    "text": text,
    "model_id": "eleven_multilingual_v2"
}

response = requests.post(
    url,
    json=data,
    headers=headers
)

# ---------- SAVE ----------

with open(
    "assets/voice.mp3",
    "wb"
) as f:

    f.write(response.content)

print("✅ Voice generated")