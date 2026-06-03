from faster_whisper import WhisperModel
from moviepy.editor import *
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os


if not hasattr(Image, "ANTIALIAS"):
    Image.ANTIALIAS = Image.Resampling.LANCZOS

video_path = "output/ai_cinematic_reel.mp4"
audio_path = "assets/voice.mp3"

video = VideoFileClip(video_path)

print("\nLoading Whisper model...\n")

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8",
)

print("\nGenerating subtitles...\n")

segments, info = model.transcribe(
    audio_path,
    word_timestamps=True,
)

subtitle_clips = []

FONT_SIZE = 86
MAX_WORDS = 3
COLORS = ["#FFFFFF", "#FFD43B"]


def make_subtitle_image(text, color):
    img = Image.new("RGBA", (1080, 260), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("arialbd.ttf", FONT_SIZE)
    except Exception:
        try:
            font = ImageFont.truetype("arial.ttf", FONT_SIZE)
        except Exception:
            font = ImageFont.load_default()

    text = text.upper()
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x = (1080 - text_width) / 2
    y = 72

    for dx in range(-5, 6):
        for dy in range(-5, 6):
            draw.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0, 210))

    draw.text((x, y), text, font=font, fill=color)
    return np.array(img)


for segment in segments:
    words = [word for word in segment.words if word.word.strip()]

    group = []

    for word in words:
        group.append(word)

        if len(group) >= MAX_WORDS:
            text = " ".join(item.word.strip() for item in group)
            start = group[0].start
            end = group[-1].end
            color = COLORS[len(subtitle_clips) % len(COLORS)]

            subtitle_clips.append(
                ImageClip(make_subtitle_image(text, color))
                .set_start(start)
                .set_duration(max(0.25, end - start))
                .set_position(("center", 1420))
                .fadein(0.03)
                .fadeout(0.03)
            )

            group = []

    if group:
        text = " ".join(item.word.strip() for item in group)
        start = group[0].start
        end = group[-1].end
        color = COLORS[len(subtitle_clips) % len(COLORS)]

        subtitle_clips.append(
            ImageClip(make_subtitle_image(text, color))
            .set_start(start)
            .set_duration(max(0.25, end - start))
            .set_position(("center", 1420))
            .fadein(0.03)
            .fadeout(0.03)
        )

print("\nCreating final subtitle timeline...\n")

final = CompositeVideoClip(
    [video] + subtitle_clips,
    size=video.size,
)

output_file = "output/final_subtitled_reel.mp4"

print("\nRendering viral subtitles...\n")

final.write_videofile(
    output_file,
    fps=24,
    codec="libx264",
    audio_codec="aac",
    preset="superfast",
    bitrate="5500k",
    threads=4,
)

print("\nTikTok subtitles added successfully.")
print(output_file)
