import requests

API_KEY = "f614db18963a0bb7e13b9f017cfff461cd77e86a249e13d5f26d05917b6eb9b7"

VOICE_ID = "EXAVITQu4vr4xnSDxMaL"

# READ TOPIC
with open("topic.txt", "r", encoding="utf-8") as f:
    topic = f.read().strip()

# SALES STYLE SCRIPT
text = f"""
POV:
You finally stopped delaying your dream trip.

Welcome to {topic}.

Luxury stays.
Private experiences.
Unreal sunsets.

This is the kind of trip
you’ll remember for the rest of your life.

Imagine waking up to ocean views,
beautiful resorts,
and moments that don’t even feel real.

Not another boring routine.

Not another stressful week.

Just freedom.
Luxury.
Memories.

If this feels like your kind of escape,
DM us now and let’s plan your dream trip.
"""

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

response = requests.post(url, json=data, headers=headers)

if response.status_code != 200:
    print("ERROR:")
    print(response.text)
    exit()

with open("assets/voice.mp3", "wb") as f:
    f.write(response.content)

print("✅ Voice generated successfully.")