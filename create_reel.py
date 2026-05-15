import subprocess
import os

print("\n🔥 AI Reel Generator Starting...\n")

# ---------- INPUT TOPIC ----------

topic = input("Enter reel topic: ")

with open("topic.txt", "w", encoding="utf-8") as f:
    f.write(topic)

print(f"\n🎯 Topic Selected: {topic}\n")

# ---------- STEP 1 — VOICE ----------

print("🎤 Generating AI voice...")

subprocess.run(
    ["python", "voice_generator.py"]
)

if not os.path.exists("assets/voice.mp3"):

    print("❌ voice.mp3 not found")
    exit()

print("✅ Voice generated\n")

# ---------- STEP 2 — CLIPS ----------

print("🎬 Downloading cinematic clips...")

subprocess.run(
    ["python", "clip_downloader.py"]
)

# CHECK CLIPS

clips_found = False

for i in range(1, 9):

    if os.path.exists(f"assets/clip{i}.mp4"):
        clips_found = True
        break

if not clips_found:

    print("❌ No clips downloaded")
    exit()

print("✅ Clips downloaded\n")

# ---------- STEP 3 — RENDER ----------

print("🎞️ Rendering cinematic reel...")

subprocess.run(
    ["python", "video_editor.py"]
)

# ---------- FINAL CHECK ----------

output_path = "output/final_reel.mp4"

if os.path.exists(output_path):

    print("\n🚀 REEL GENERATED SUCCESSFULLY!")

    print(f"📁 Location: {output_path}")

else:

    print("❌ Reel generation failed")