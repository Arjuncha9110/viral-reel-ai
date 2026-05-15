from datetime import datetime
from moviepy.editor import *
from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.video.VideoClip import TextClip
from moviepy.video.compositing.CompositeVideoClip import CompositeVideoClip
from moviepy.video.fx import CrossFadeIn, CrossFadeOut
import os
import random

# ---------- LOAD CLIPS ----------

clips = []

for i in range(1, 30):

    clip_path = f"assets/clip{i}.mp4"

    if os.path.exists(clip_path):

        print(f"Loading {clip_path}")

        # ---------- SKIP BROKEN CLIPS ----------

        try:

            clip = VideoFileClip(
                clip_path,
                audio=False
            )

        except Exception as e:

            print(f"❌ Skipping broken clip: {clip_path}")

            print(e)

            continue

        # ---------- LONGER CLIP DURATION ----------

        clip = clip.subclipped(
            0,
            min(3.5, clip.duration)
        )

        # ---------- HIGH QUALITY VERTICAL ----------

        clip = clip.resized(height=1920)

        # ---------- 9:16 CROP ----------

        clip = clip.cropped(
            x_center=clip.w / 2,
            width=1080,
            y_center=clip.h / 2,
            height=1920
        )

        # ---------- SUBTLE CINEMATIC ZOOM ----------

        clip = clip.resized(
            lambda t: 1 + 0.015 * t
        )

        # ---------- CINEMATIC TRANSITIONS ----------

        clip = clip.with_effects([
            CrossFadeIn(0.3),
            CrossFadeOut(0.3)
        ])

        clips.append(clip)

# ---------- CHECK ----------

if len(clips) == 0:

    print("❌ No usable clips found")
    exit()

# ---------- COMBINE CLIPS ----------

print("Combining clips...")

final_video = concatenate_videoclips(
    clips,
    method="compose",
    padding=-0.3
)

# ---------- READ TOPIC ----------

with open("topic.txt", "r", encoding="utf-8") as f:
    topic = f.read().strip()

# ---------- AI VIRAL HOOKS ----------

bali_hooks = [
    "POV: You escaped to Bali...",
    "This Bali villa feels unreal...",
    "Luxury Bali under budget? 👀",
    "This hidden Bali spot looks fake...",
    "You need to see this Bali paradise..."
]

dubai_hooks = [
    "Dubai luxury hits different...",
    "This Dubai experience feels illegal...",
    "POV: You became rich overnight...",
    "Luxury Dubai under budget? 👀",
    "This Dubai view is unreal..."
]

tokyo_hooks = [
    "Tokyo nights hit different 🌃",
    "Japan feels like the future...",
    "This Tokyo street looks cinematic...",
    "POV: First night in Tokyo...",
    "Tokyo after midnight is unreal..."
]

turkey_hooks = [
    "Turkey feels straight out of a movie...",
    "This Istanbul sunset looks fake...",
    "Hidden luxury in Turkey 👀",
    "POV: You finally visited Turkey...",
    "Turkey is insanely underrated..."
]

maldives_hooks = [
    "This Maldives villa looks unreal...",
    "POV: Private island life 🌊",
    "Luxury paradise exists...",
    "This water looks fake...",
    "The Maldives feels illegal..."
]

generic_hooks = [
    f"Welcome to {topic}",
    f"This {topic} experience is unreal...",
    f"POV: You finally visited {topic}...",
    f"{topic} looks straight out of a movie...",
    f"This place is insanely underrated..."
]

# ---------- SELECT HOOK ----------

if "bali" in topic.lower():

    hook_text = random.choice(bali_hooks)

    cta_text = 'DM "BALI" for packages ✈️'

elif "dubai" in topic.lower():

    hook_text = random.choice(dubai_hooks)

    cta_text = 'DM "DUBAI" for details ✈️'

elif "tokyo" in topic.lower():

    hook_text = random.choice(tokyo_hooks)

    cta_text = 'DM "TOKYO" for itinerary 🇯🇵'

elif "turkey" in topic.lower():

    hook_text = random.choice(turkey_hooks)

    cta_text = 'DM "TURKEY" for packages ✈️'

elif "maldives" in topic.lower():

    hook_text = random.choice(maldives_hooks)

    cta_text = 'DM "MALDIVES" for resorts 🌊'

else:

    hook_text = random.choice(generic_hooks)

    cta_text = f'DM NOW for {topic} packages ✈️'

# ---------- HOOK TEXT ----------

hook = TextClip(
    text=hook_text,
    font_size=75,
    color="white",
    stroke_color="black",
    stroke_width=4,
    method="label"
)

hook = (
    hook
    .with_position(("center", 120))
    .with_duration(3)
)

final_video = CompositeVideoClip(
    [final_video, hook]
)

# ---------- LOAD VOICE ----------

voice_path = "assets/voice.mp3"

if not os.path.exists(voice_path):

    print("❌ voice.mp3 not found")
    exit()

voice = AudioFileClip(voice_path)

# ---------- ADD AUDIO ----------

final_video = final_video.with_audio(voice)

# ---------- CTA ----------

cta = TextClip(
    text=cta_text,
    font_size=60,
    color="yellow",
    stroke_color="black",
    stroke_width=3,
    method="label"
)

cta = (
    cta
    .with_position(("center", 1700))
    .with_start(final_video.duration - 4)
    .with_duration(4)
)

final_video = CompositeVideoClip(
    [final_video, cta]
)

# ---------- CREATE OUTPUT ----------

os.makedirs("output", exist_ok=True)

# ---------- DYNAMIC FILE NAME ----------

timestamp = datetime.now().strftime(
    "%Y-%m-%d_%H-%M-%S"
)

safe_topic = topic.replace(
    " ",
    "_"
).lower()

output_file = (
    f"output/{safe_topic}_reel_{timestamp}.mp4"
)

# ---------- EXPORT ----------

print("Rendering cinematic reel...")

final_video.write_videofile(
    output_file,
    fps=30,
    codec="libx264",
    audio_codec="aac",
    preset="medium",
    bitrate="8000k"
)

print(f"✅ Reel saved as: {output_file}")