import requests

API_KEY = "f614db18963a0bb7e13b9f017cfff461cd77e86a249e13d5f26d05917b6eb9b7"

VOICE_ID = "EXAVITQu4vr4xnSDxMaL"

# ---------- READ TOPIC ----------

with open("topic.txt", "r", encoding="utf-8") as f:
    topic = f.read().strip()

# ---------- DYNAMIC VOICE SCRIPT ----------

if "turkey" in topic.lower():

    text = """
    Welcome to Turkey.

    Beautiful mosques.
    Luxury resorts.
    Stunning sunsets.

    Explore Istanbul like never before.

    DM us now for Turkey travel packages.
    """

elif "bali" in topic.lower():

    text = """
    Welcome to Bali.

    Infinity pools.
    Luxury villas.
    Tropical paradise.

    This escape feels unreal.

    DM us now for Bali packages.
    """

elif "dubai" in topic.lower():

    text = """
    Welcome to luxury Dubai.

    Sky-high views.
    Luxury experiences.
    Unforgettable nightlife.

    This city feels unreal.

    DM us now for Dubai packages.
    """

elif "tokyo" in topic.lower():

    text = """
    Tokyo nights hit different.

    Neon streets.
    Luxury experiences.
    Endless energy.

    Experience Japan like never before.

    DM us now for Tokyo itineraries.
    """

else:

    text = f"""
    Welcome to {topic}.

    Beautiful destinations.
    Luxury experiences.
    Unforgettable memories.

    Your dream trip starts here.

    DM us now for details.
    """

# ---------- ELEVENLABS API ----------

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

# ---------- ERROR CHECK ----------

if response.status_code != 200:
    print("ERROR:")
    print(response.text)
    exit()

# ---------- SAVE AUDIO ----------

with open("assets/voice.mp3", "wb") as f:
    f.write(response.content)

print("✅ Dynamic voice generated successfully.")