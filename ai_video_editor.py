from moviepy.editor import *
from PIL import Image
import os
import glob
import random

# ---------- FIX PIL ----------

if not hasattr(Image, "ANTIALIAS"):
    Image.ANTIALIAS = Image.Resampling.LANCZOS

# ---------- SETTINGS ----------

WIDTH = 1080
HEIGHT = 1920

# ---------- LOAD AUDIO ----------

voice_path = "assets/voice.mp3"

voice = None

if os.path.exists(voice_path):

    voice = AudioFileClip(voice_path)

# ---------- LOAD MUSIC ----------

music_path = "assets/music.mp3"

music = None

if os.path.exists(music_path):

    music = AudioFileClip(music_path)

# ---------- LOAD IMAGES ----------

images = sorted(
    glob.glob("ai_images/*.png")
)

if len(images) == 0:

    print("No images found.")
    exit()

# ---------- SCENE DURATION ----------

if voice:

    scene_duration = voice.duration / len(images)

else:

    scene_duration = 5

clips = []

# ---------- CREATE CLIPS ----------

for image_path in images:

    print(f"Loading {image_path}")

    clip = ImageClip(image_path)

    # ---------- DURATION ----------

    clip = clip.set_duration(scene_duration)

    # ---------- RESIZE ----------

    clip = clip.resize(
        width=WIDTH
    )

    # ---------- CENTER CROP ----------

    clip = clip.crop(
        x_center=clip.w / 2,
        y_center=clip.h / 2,
        width=WIDTH,
        height=HEIGHT
    )

    # ---------- LIGHT CINEMATIC MOTION ----------

    zoom = random.choice([1.03, 1.05])

    clip = clip.resize(zoom)

    # ---------- TRANSITIONS ----------

    clip = clip.fadein(0.3).fadeout(0.3)

    clips.append(clip)

# ---------- COMBINE ----------

print("\nCreating cinematic timeline...\n")

final_video = concatenate_videoclips(
    clips,
    method="compose",
    padding=-0.2
)

# ---------- ADD VOICE ----------

if voice:

    voice = voice.volumex(1.4)

    final_video = final_video.set_audio(
        voice
    )

# ---------- ADD MUSIC ----------

if music:

    music = music.volumex(0.12)

    if voice:

        final_audio = CompositeAudioClip([
            music,
            voice
        ])

    else:

        final_audio = music

    final_video = final_video.set_audio(
        final_audio
    )

# ---------- COLOR BOOST ----------

final_video = final_video.fx(
    vfx.colorx,
    1.08
)

# ---------- OUTPUT ----------

os.makedirs("output", exist_ok=True)

output_file = "output/ai_cinematic_reel.mp4"

# ---------- EXPORT ----------

print("\nRendering final reel...\n")

final_video.write_videofile(
    output_file,
    fps=24,
    codec="libx264",
    audio_codec="aac",
    preset="ultrafast",
    bitrate="4500k",
    threads=4
)

print("\nAI cinematic reel generated successfully.")
print(output_file)
