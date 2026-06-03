import json
import re


def clean_topic(value):
    value = value.strip()
    value = re.sub(r"\s+", " ", value)
    return value or "Bali"


with open("topic.txt", "r", encoding="utf-8") as f:
    topic = clean_topic(f.read())

with open("style.txt", "r", encoding="utf-8") as f:
    style = f.read().strip()

if any(word in style for word in ["Finance", "Stock", "Trading"]):
    scenes = [
        {"query": "stock market screen", "beat": "hook"},
        {"query": "trading desk monitors", "beat": "problem"},
        {"query": "business office night", "beat": "discipline"},
        {"query": "financial district skyline", "beat": "wealth"},
        {"query": "luxury watch business", "beat": "status"},
        {"query": "businessman city night", "beat": "cta"},
    ]
else:
    scenes = [
        {"query": f"{topic} skyline", "beat": "hook"},
        {"query": f"{topic} drone beach", "beat": "arrival"},
        {"query": f"{topic} luxury hotel pool", "beat": "luxury"},
        {"query": f"{topic} street food night", "beat": "food"},
        {"query": f"{topic} rooftop skyline", "beat": "nightlife"},
        {"query": f"{topic} shopping street", "beat": "lifestyle"},
        {"query": f"{topic} sunset ocean", "beat": "dream"},
        {"query": f"{topic} city nightlife", "beat": "cta"},
    ]

with open("scenes.json", "w", encoding="utf-8") as f:
    json.dump(scenes, f, indent=4)

print("Viral clip beats generated successfully")
print(json.dumps(scenes, indent=2))
