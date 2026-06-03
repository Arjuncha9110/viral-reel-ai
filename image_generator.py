from openai import OpenAI
import json
import os
import base64

# ---------- OPENAI ----------

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# ---------- LOAD TOPIC ----------

with open(
    "topic.txt",
    "r",
    encoding="utf-8"
) as f:

    topic = f.read().strip()

# ---------- LOAD STYLE ----------

with open(
    "style.txt",
    "r",
    encoding="utf-8"
) as f:

    style = f.read().strip()

# ---------- LOAD SCENES ----------

with open(
    "scenes.json",
    "r",
    encoding="utf-8"
) as f:

    scenes = json.load(f)

# ---------- CREATE FOLDER ----------

os.makedirs("ai_images", exist_ok=True)

# ---------- GENERATE IMAGES ----------

for i, scene in enumerate(scenes):

    print(f"\nGenerating: {scene}")

    prompt = f"""
    Ultra realistic cinematic vertical image of {scene}.

    Style:
    {style}

    Highly detailed.
    Dramatic lighting.
    Viral Instagram reel aesthetic.
    Luxury cinematic composition.
    9:16 aspect ratio.
    """

    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1792",
        response_format="b64_json"
    )

    # ---------- GET BASE64 IMAGE ----------

    image_base64 = response.data[0].b64_json

    image_data = base64.b64decode(image_base64)

    # ---------- SAVE IMAGE ----------

    save_path = f"ai_images/image{i+1}.png"

    with open(save_path, "wb") as f:

        f.write(image_data)

    print(f"Saved {save_path}")

print("\nAI images generated successfully.")