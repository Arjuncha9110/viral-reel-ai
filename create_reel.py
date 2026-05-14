import subprocess
import os

print("\n🔥 AI Reel Generator Starting...\n")

# ASK TOPIC
topic = input("Enter reel topic: ")

with open("topic.txt", "w", encoding="utf-8") as f:
    f.write(topic)

print(f"\n🎯 Topic Selected: {topic}\n")

# STEP 1 — GENERATE VOICE
print("🎤 Generating AI voice...")
subprocess.run(["python", "voice_generator.py"])

if not os.path.exists("assets/voice.mp3"):
    print("❌ voice.mp3 not found")
    exit()

print("✅ Voice generated\n")

# STEP 2 — DOWNLOAD CLIPS
print("🎬 Downloading clips...")
subprocess.run(["python", "clip_downloader.py"])

print("✅ Clips downloaded\n")

# STEP 3 — DOWNLOAD MUSIC
print("🎵 Downloading background music...")
subprocess.run(["python", "music_downloader.py"])

print("✅ Music downloaded\n")

# STEP 4 — CREATE FINAL REEL
print("🎞️ Rendering final reel...")
subprocess.run(["python", "video_editor.py"])

# CHECK OUTPUT
if os.path.exists("output/final_reel.mp4"):
    print("\n🚀 REEL GENERATED SUCCESSFULLY!")
    print("📁 Location: output/final_reel.mp4")
else:
    print("❌ Reel generation failed")