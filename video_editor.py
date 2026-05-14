from moviepy import *
from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
import os

# ---------- LOAD CLIPS ----------

clips = []

for i in range(1, 9):

    clip_path = f"assets/clip{i}.mp4"

    if os.path.exists(clip_path):

        clip = VideoFileClip(clip_path)

        # Short cinematic cuts
        clip = clip.subclipped(0, min(3, clip.duration))

        # Resize to vertical reel format
        clip = clip.resized(height=1920)

        # Center crop for 9:16 reels
        clip = clip.cropped(
            x_center=clip.w / 2,
            width=1080,
            y_center=clip.h / 2,
            height=1920
        )

        clips.append(clip)

# ---------- CHECK CLIPS ----------

if len(clips) == 0:
    print("❌ No clips found in assets/")
    exit()

# ---------- COMBINE CLIPS ----------

final_video = concatenate_videoclips(
    clips,
    method="compose"
)

# ---------- LOAD VOICE ----------

voice = AudioFileClip("assets/voice.mp3")

# ---------- MATCH VIDEO LENGTH TO VOICE ----------

final_video = final_video.subclipped(
    0,
    min(final_video.duration, voice.duration)
)

# ---------- ADD VOICE ----------

final_video = final_video.with_audio(voice)

# ---------- CREATE OUTPUT FOLDER ----------

os.makedirs("output", exist_ok=True)

# ---------- EXPORT VIDEO ----------

final_video.write_videofile(
    "output/final_reel.mp4",
    fps=30,
    codec="libx264",
    audio_codec="aac"
)

print("✅ Reel created successfully.")