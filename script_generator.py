from openai import OpenAI
import json
import os

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY")
)

# ---------- LOAD TOPIC ----------

with open("topic.txt", "r", encoding="utf-8") as f:
    topic = f.read().strip()

# ---------- PROMPT ----------

prompt = f"""
Create a viral Instagram reel script about {topic}.

Requirements:
- luxury cinematic style
- strong hook
- emotional storytelling
- 30 second reel
- short viral lines
- Gen Z style
- CTA at end

Return JSON format:

{{
    "hook": "...",
    "voiceover": "...",
    "cta": "..."
}}
"""

# ---------- API ----------

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ]
)

content = response.choices[0].message.content

# ---------- CLEAN ----------

content = content.replace("```json", "")
content = content.replace("```", "")

data = json.loads(content)

# ---------- SAVE ----------

with open("script.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print("✅ Script generated")