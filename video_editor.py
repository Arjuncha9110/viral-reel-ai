from datetime import datetime
from moviepy.editor import *
from PIL import Image, ImageDraw, ImageFont
import json
import numpy as np
import os
import random
import re
import shutil
import subprocess


if not hasattr(Image, "ANTIALIAS"):
    Image.ANTIALIAS = Image.Resampling.LANCZOS

WIDTH = 1080
HEIGHT = 1920


def read_target_duration():
    try:
        with open("video_length.txt", "r", encoding="utf-8") as f:
            value = int(float(f.read().strip()))
    except Exception:
        value = 30
    return max(20, min(value, 45))


MAX_DURATION = read_target_duration()
ENCODER_THREADS = max(4, os.cpu_count() or 4)
INTRO_ASSETS = [
    "assets/avatar_intro.mp4",
    "assets/talking_avatar.mp4",
]
CTA_ASSET = "assets/avatar_cta.mp4"
LOGO_ASSETS = [
    "assets/logo.png",
    "assets/logo.jpg",
    "assets/logo.jpeg",
    "assets/logo.webp",
]


def encoder_available(encoder_name):
    try:
        import imageio_ffmpeg

        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        result = subprocess.run(
            [ffmpeg_exe, "-hide_banner", "-encoders"],
            capture_output=True,
            text=True,
            timeout=8,
        )
        return encoder_name in result.stdout
    except Exception:
        return False


def video_encoder_settings():
    preferred = os.getenv("REEL_VIDEO_ENCODER", "auto").strip().lower()

    if preferred in {"cpu", "libx264"}:
        return "libx264", "superfast", "5500k", ["-movflags", "+faststart"]

    if preferred in {"auto", "gpu", "nvenc", "h264_nvenc"} and encoder_available("h264_nvenc"):
        return (
            "h264_nvenc",
            "p4",
            "8000k",
            [
                "-rc", "vbr",
                "-cq", "21",
                "-maxrate", "10000k",
                "-bufsize", "16000k",
                "-pix_fmt", "yuv420p",
                "-movflags", "+faststart",
            ],
        )

    return "libx264", "superfast", "5500k", ["-movflags", "+faststart"]


def short_slug(value):
    value = value.lower()
    destination_aliases = {
        "japan": ["japan", "tokyo", "kyoto", "osaka", "fuji", "shibuya"],
        "bali": ["bali", "ubud", "canggu", "seminyak", "uluwatu"],
        "dubai": ["dubai", "burj", "marina", "desert safari"],
        "thailand": ["thailand", "thai", "phuket", "bangkok", "krabi", "chiang mai", "phi phi"],
        "vietnam": ["vietnam", "hanoi", "ha long", "halong", "danang", "da nang", "hoi an", "saigon", "ho chi minh", "sapa", "mekong", "ninh binh"],
        "paris": ["paris", "eiffel"],
        "london": ["london"],
        "singapore": ["singapore"],
        "maldives": ["maldives", "overwater", "lagoon"],
        "switzerland": ["switzerland"],
        "italy": ["italy"],
        "greece": ["greece"],
        "turkey": ["turkey"],
        "new_york": ["new york", "new york city"],
        "miami": ["miami"],
        "goa": ["goa"],
        "kerala": ["kerala"],
        "rajasthan": ["rajasthan"],
    }

    for destination, aliases in destination_aliases.items():
        for alias in sorted(aliases, key=len, reverse=True):
            if re.search(rf"\b{re.escape(alias)}\b", value):
                return destination

    clean = "".join(ch if ch.isalnum() else "_" for ch in value)
    clean = "_".join(part for part in clean.split("_") if part)
    return (clean[:32] or "travel")


def first_existing(paths):
    for path in paths:
        if os.path.exists(path):
            return path
    return None


def avatar_hook_enabled():
    try:
        with open("avatar_hook_enabled.txt", "r", encoding="utf-8") as f:
            return f.read().strip() == "1"
    except FileNotFoundError:
        return False


def beat_audio_path(story_index):
    manifest_path = "assets/voice_manifest.json"
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8-sig") as f:
                manifest = json.load(f)
            for item in manifest:
                if int(item.get("story_index", -1)) == story_index:
                    path = item.get("audio_path", "")
                    if path and os.path.exists(path):
                        return path
        except Exception:
            pass

    for extension in ["mp3", "wav"]:
        path = f"assets/voice_beats/beat_{story_index + 1}.{extension}"
        if os.path.exists(path):
            return path

    return None


def story_clip_path(story_index):
    manifest_path = "assets/clip_manifest.json"
    clip_number = str(story_index + 1)

    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8-sig") as f:
                manifest = json.load(f)
            path = manifest.get(clip_number, "")
            if path and os.path.exists(path):
                return path
        except Exception:
            pass

    legacy_path = f"assets/clip{story_index + 1}.mp4"
    if os.path.exists(legacy_path):
        return legacy_path

    return None


def make_vertical_clip(raw_clip, duration=None, index=0):
    if duration is not None:
        duration = max(1.5, duration)

        if raw_clip.duration > duration + 0.5:
            start = random.uniform(0, raw_clip.duration - duration)
            clip = raw_clip.subclip(start, start + duration)
        elif raw_clip.duration < duration - 0.05:
            clip = raw_clip.fx(vfx.loop, duration=duration)
        else:
            clip = raw_clip.subclip(0, min(raw_clip.duration, duration))
    else:
        clip = raw_clip

    clip = clip.resize(height=HEIGHT)

    if clip.w < WIDTH:
        clip = clip.resize(width=WIDTH)

    clip = clip.crop(
        x_center=clip.w / 2,
        y_center=clip.h / 2,
        width=WIDTH,
        height=HEIGHT,
    )

    result = CompositeVideoClip(
        [clip.set_position("center")],
        size=(WIDTH, HEIGHT),
    ).set_duration(duration or clip.duration).fadein(0.04).fadeout(0.04)

    if clip.audio is not None:
        result = result.set_audio(clip.audio)

    return result


def make_avatar_clip(path, max_duration):
    if not path or not os.path.exists(path):
        return None

    print(f"Using HeyGen/avatar story clip: {path}")
    clip = VideoFileClip(path)
    start = 0.15 if clip.duration > 1 else 0
    clip = clip.subclip(start, min(clip.duration, start + max_duration))
    return make_vertical_clip(clip, duration=None, index=0)


def fit_text(draw, text, font_path, max_width, start_size, min_size=34):
    size = start_size
    while size >= min_size:
        try:
            font = ImageFont.truetype(font_path, size)
        except Exception:
            font = ImageFont.load_default()

        bbox = draw.textbbox((0, 0), text, font=font)
        if bbox[2] - bbox[0] <= max_width:
            return font

        size -= 4

    return font


def draw_centered_text(draw, text, y, font, fill, stroke_width=5, stroke_fill=(0, 0, 0, 210)):
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
    text_w = bbox[2] - bbox[0]
    x = (WIDTH - text_w) / 2
    draw.text(
        (x, y),
        text,
        font=font,
        fill=fill,
        stroke_width=stroke_width,
        stroke_fill=stroke_fill,
    )


def find_logo_path():
    return first_existing(LOGO_ASSETS)


def word_count(text):
    return max(1, len(re.findall(r"[A-Za-z0-9]+", text or "")))


def allocate_story_durations(items, target_duration):
    if not items:
        return []

    weights = [word_count(item.get("voice", "")) for item in items]
    total_weight = sum(weights) or len(items)
    raw_durations = [
        max(1.8, target_duration * (weight / total_weight))
        for weight in weights
    ]

    total = sum(raw_durations)
    if total > 0:
        scale = target_duration / total
        raw_durations = [duration * scale for duration in raw_durations]

    return [round(max(1.5, duration), 2) for duration in raw_durations]


def cta_label_from_story(story, topic):
    for item in reversed(story or []):
        caption = re.sub(r"[^A-Za-z0-9\s]", "", item.get("caption", "")).strip()
        if caption:
            return caption.upper()[:24]

    slug = short_slug(topic).replace("_", " ").upper()
    return f"SAVE {slug}"[:24]


def destination_label(topic):
    slug = short_slug(topic).replace("_", " ").strip()
    return (slug.title() or "This Trip")[:28]


def make_intro_hook_graphic(text, duration):
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    title = (text or "THIS TRIP FEELS UNREAL").upper()
    title_lines = wrap_caption(title, max_chars=15)

    serif = r"C:\Windows\Fonts\georgiab.ttf"
    bold = r"C:\Windows\Fonts\arialbd.ttf"
    ui = r"C:\Windows\Fonts\segoeuib.ttf"

    logo_path = find_logo_path()
    if logo_path:
        try:
            logo_img = Image.open(logo_path).convert("RGBA")
            logo_img.thumbnail((220, 220), Image.Resampling.LANCZOS)
            img.alpha_composite(logo_img, (int((WIDTH - logo_img.width) / 2), 86))
        except Exception as e:
            print(f"Could not draw intro logo: {e}")

    pill_text = "LUXURY TRAVEL GUIDE"
    pill_font = fit_text(draw, pill_text, ui, 650, 38, 28)
    bbox = draw.textbbox((0, 0), pill_text, font=pill_font)
    draw.text(
        ((WIDTH - (bbox[2] - bbox[0])) / 2, 1114),
        pill_text,
        font=pill_font,
        fill="#FFD86B",
        stroke_width=3,
        stroke_fill=(0, 0, 0, 220),
    )

    hook_font = fit_text(draw, "STOP", serif, 880, 150, 72)
    hook2_font = fit_text(draw, "SCROLLING", serif, 880, 130, 68)
    draw_centered_text(draw, "STOP", 1190, hook_font, "#FFD86B", stroke_width=8)
    draw_centered_text(draw, "SCROLLING", 1312, hook2_font, "#FFFFFF", stroke_width=7)

    y = 1448
    for index, line in enumerate(title_lines[:2]):
        font = fit_text(draw, line, ui, 850, 58 if index == 0 else 50, 34)
        color = "#7DEBFF" if index == 0 else "#FDE68A"
        draw_centered_text(draw, line, y, font, color, stroke_width=5)
        y += 62

    draw.rounded_rectangle((232, 1608, WIDTH - 232, 1617), radius=5, fill=(255, 216, 105, 230))

    return (
        ImageClip(np.array(img))
        .set_duration(duration)
        .fadein(0.12)
        .fadeout(0.10)
    )


def _is_naomiworldtourz_topic(topic):
    lower = (topic or "").lower()
    return any(t in lower for t in ("naomi", "naomiworldtourz", "comment plan", "naomiworld"))


def make_cta_logo_graphic(duration, story=None, topic=""):
    overlays = []
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    serif = r"C:\Windows\Fonts\georgiab.ttf"
    ui = r"C:\Windows\Fonts\segoeuib.ttf"

    is_naomi = _is_naomiworldtourz_topic(topic)

    # ── Logo or brand text ────────────────────────────────────────────────────
    logo_path = find_logo_path()
    if logo_path:
        try:
            logo_img = Image.open(logo_path).convert("RGBA")
            logo_img.thumbnail((170, 170), Image.Resampling.LANCZOS)
            img.alpha_composite(logo_img, (int((WIDTH - logo_img.width) / 2), 92))
        except Exception as e:
            print(f"Could not draw CTA logo: {e}")
    elif is_naomi:
        brand_text = "NAOMIWORLDTOURZ"
        brand_font = fit_text(draw, brand_text, ui, 820, 46, 28)
        bbox = draw.textbbox((0, 0), brand_text, font=brand_font)
        draw.text(
            ((WIDTH - (bbox[2] - bbox[0])) / 2, 102),
            brand_text,
            font=brand_font,
            fill="#FFD86B",
            stroke_width=4,
            stroke_fill=(0, 0, 0, 220),
        )
    else:
        brand_font = fit_text(draw, "NAOMI WORLD TOURZ", ui, 420, 34, 24)
        bbox = draw.textbbox((0, 0), "NAOMI WORLD TOURZ", font=brand_font)
        draw.text(((WIDTH - (bbox[2] - bbox[0])) / 2, 112), "NAOMI WORLD TOURZ", font=brand_font, fill="#FFD86B")

    # ── CTA section ───────────────────────────────────────────────────────────
    if is_naomi:
        # "Comment PLAN" CTA — big, punchy, unmissable
        cta_line1 = "COMMENT"
        cta_line2 = "PLAN"
        sub = "& GET YOUR FREE ITINERARY"
        brand_sub = "from @NaomiWorldTourz"

        cta1_font = fit_text(draw, cta_line1, serif, 860, 128, 80)
        cta2_font = fit_text(draw, cta_line2, serif, 860, 160, 100)
        sub_font = fit_text(draw, sub, ui, 820, 46, 30)
        bs_font = fit_text(draw, brand_sub, ui, 680, 38, 26)

        # Dark pill behind CTA block
        pill_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        pill_draw = ImageDraw.Draw(pill_layer)
        try:
            pill_draw.rounded_rectangle([80, 1190, WIDTH - 80, 1590], radius=32, fill=(0, 0, 0, 160))
        except Exception:
            pill_draw.rectangle([80, 1190, WIDTH - 80, 1590], fill=(0, 0, 0, 160))
        img = Image.alpha_composite(img, pill_layer)
        draw = ImageDraw.Draw(img)

        draw_centered_text(draw, cta_line1, 1214, cta1_font, "#FFD86B", stroke_width=8)
        draw_centered_text(draw, cta_line2, 1318, cta2_font, "#FFFFFF", stroke_width=9)

        bbox = draw.textbbox((0, 0), sub, font=sub_font)
        draw.text(((WIDTH - (bbox[2] - bbox[0])) / 2, 1488), sub, font=sub_font,
                  fill="#FDE68A", stroke_width=4, stroke_fill=(0, 0, 0, 220))

        bbox = draw.textbbox((0, 0), brand_sub, font=bs_font)
        draw.text(((WIDTH - (bbox[2] - bbox[0])) / 2, 1542), brand_sub, font=bs_font,
                  fill="#FFD86B", stroke_width=3, stroke_fill=(0, 0, 0, 200))
    else:
        # Generic CTA
        destination = destination_label(topic).upper()
        eyebrow = "SAVE THIS ITINERARY"
        subline = f"{destination} BEFORE YOU BOOK"

        eyebrow_font = fit_text(draw, eyebrow, ui, 830, 54, 34)
        main_font = fit_text(draw, destination, serif, 880, 118, 64)
        sub_font = fit_text(draw, subline, ui, 840, 44, 30)

        bbox = draw.textbbox((0, 0), eyebrow, font=eyebrow_font)
        draw.text(
            ((WIDTH - (bbox[2] - bbox[0])) / 2, 1218),
            eyebrow,
            font=eyebrow_font,
            fill="#FFD86B",
            stroke_width=4,
            stroke_fill=(0, 0, 0, 230),
        )
        draw_centered_text(draw, destination, 1294, main_font, "#FFFFFF", stroke_width=7)
        bbox = draw.textbbox((0, 0), subline, font=sub_font)
        draw.text(
            ((WIDTH - (bbox[2] - bbox[0])) / 2, 1446),
            subline,
            font=sub_font,
            fill="#FDE68A",
            stroke_width=4,
            stroke_fill=(0, 0, 0, 220),
        )

    footer = "@NaomiWorldTourz" if is_naomi else "Naomi World Tourz"
    footer_font = fit_text(draw, footer, ui, 520, 30, 22)
    draw_centered_text(draw, footer, 1620, footer_font, "#FDE68A", stroke_width=3)

    overlays.append(
        ImageClip(np.array(img))
        .set_duration(duration)
        .fadein(0.12)
        .fadeout(0.10)
    )

    return overlays


def polish_intro_clip(clip, story):
    if clip is None:
        return None

    caption = ""
    if story:
        caption = story[0].get("caption") or story[0].get("voice") or ""

    hook = make_intro_hook_graphic(caption, clip.duration)
    return CompositeVideoClip([clip, hook], size=(WIDTH, HEIGHT)).set_audio(clip.audio).set_duration(clip.duration)


def polish_cta_clip(clip, story=None, topic=""):
    if clip is None:
        return None

    overlays = make_cta_logo_graphic(clip.duration, story, topic)
    result = CompositeVideoClip([clip] + overlays, size=(WIDTH, HEIGHT)).set_duration(clip.duration)
    if clip.audio is not None:
        result = result.set_audio(clip.audio)
    return result


def wrap_caption(text, max_chars=14):
    words = text.upper().split()
    lines = []
    current = []

    for word in words:
        candidate = " ".join(current + [word])

        if len(candidate) > max_chars and current:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)

    if current:
        lines.append(" ".join(current))

    return lines[:2]


def rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    try:
        draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)
    except Exception:
        draw.rectangle(xy, fill=fill, outline=outline, width=width)


def make_caption(text, start, duration):
    """
    Luxury cinematic caption — bold font, pill background, gold+white palette.
    Positioned in the lower third (Instagram Reels / YouTube Shorts safe zone).
    """
    CANVAS_H = 360
    img = Image.new("RGBA", (WIDTH, CANVAS_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Font stack: try bold Windows fonts, fall back gracefully
    FONT_PATHS = [
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf",
        "arialbd.ttf",
        "arial.ttf",
    ]
    def load_font(size):
        for fp in FONT_PATHS:
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                continue
        return ImageFont.load_default()

    font = load_font(92)
    small_font = load_font(74)

    lines = wrap_caption(text, max_chars=14)[:2]
    if not lines:
        return ImageClip(np.array(img)).set_start(start).set_duration(duration)

    # Measure all lines
    line_data = []
    for index, line in enumerate(lines):
        f = font if index == 0 else small_font
        bbox = draw.textbbox((0, 0), line, font=f, stroke_width=6)
        line_data.append({
            "line": line,
            "font": f,
            "w": bbox[2] - bbox[0],
            "h": bbox[3] - bbox[1],
            "color": "#FFD86B" if index == 0 else "#FFFFFF",
        })

    PAD_X, PAD_Y = 32, 18
    LINE_GAP = 10
    total_h = sum(d["h"] for d in line_data) + LINE_GAP * (len(line_data) - 1)
    max_w = max(d["w"] for d in line_data)

    # Draw dark semi-transparent pill background
    pill_x0 = (WIDTH - max_w) / 2 - PAD_X
    pill_y0 = (CANVAS_H - total_h) / 2 - PAD_Y
    pill_x1 = (WIDTH + max_w) / 2 + PAD_X
    pill_y1 = (CANVAS_H + total_h) / 2 + PAD_Y

    # Overlay layer for pill
    pill_layer = Image.new("RGBA", (WIDTH, CANVAS_H), (0, 0, 0, 0))
    pill_draw = ImageDraw.Draw(pill_layer)
    try:
        pill_draw.rounded_rectangle(
            [pill_x0, pill_y0, pill_x1, pill_y1],
            radius=22,
            fill=(0, 0, 0, 155),
        )
    except Exception:
        pill_draw.rectangle([pill_x0, pill_y0, pill_x1, pill_y1], fill=(0, 0, 0, 155))
    img = Image.alpha_composite(img, pill_layer)
    draw = ImageDraw.Draw(img)

    # Draw text lines
    y = (CANVAS_H - total_h) / 2
    for d in line_data:
        x = (WIDTH - d["w"]) / 2
        # Thick drop shadow
        draw.text((x + 4, y + 6), d["line"], font=d["font"],
                  fill=(0, 0, 0, 180), stroke_width=8, stroke_fill=(0, 0, 0, 180))
        # Main text
        draw.text((x, y), d["line"], font=d["font"],
                  fill=d["color"], stroke_width=5, stroke_fill=(0, 0, 0, 230))
        y += d["h"] + LINE_GAP

    return (
        ImageClip(np.array(img))
        .set_start(start)
        .set_duration(duration)
        .set_position(("center", 1240))
        .fadein(0.05)
        .fadeout(0.07)
    )


def load_music(duration, topic_text=""):
    lower = (topic_text or "").lower()
    is_travel = any(t in lower for t in ("travel", "naomi", "hidden", "oman", "georgia", "morocco", "bali", "japan", "honeymoon"))
    is_finance = any(t in lower for t in ("stock", "finance", "trading", "market"))

    if is_travel:
        candidates = [
            "music/luxury.mp3",
            "music/cinematic.mp3",
            "music/tropical.mp3",
            "assets/music.mp3",
            "music/phonk.mp3",
        ]
    elif is_finance:
        candidates = [
            "music/phonk.mp3",
            "music/cinematic.mp3",
            "assets/music.mp3",
        ]
    else:
        candidates = [
            "assets/music.mp3",
            "music/tropical.mp3",
            "music/luxury.mp3",
            "music/cinematic.mp3",
            "music/phonk.mp3",
        ]

    for path in candidates:
        if os.path.exists(path):
            print(f"Adding background music: {path}")
            music = AudioFileClip(path).volumex(0.22)

            if music.duration < duration:
                loops = int(duration // music.duration) + 1
                music = concatenate_audioclips([music] * loops)

            return music.subclip(0, duration).audio_fadein(0.4).audio_fadeout(0.6)

    print("No background music found.")
    return None


with open("topic.txt", "r", encoding="utf-8-sig") as f:
    topic = f.read().strip() or "Luxury Travel"

with open("story.json", "r", encoding="utf-8-sig") as f:
    story = json.load(f)

print(f"\nCreating story-driven 9:16 reel for: {topic}\n")

os.makedirs("output", exist_ok=True)

use_avatar_hook = avatar_hook_enabled()
intro_path = first_existing(INTRO_ASSETS) if use_avatar_hook else None
cta_path = CTA_ASSET if use_avatar_hook and os.path.exists(CTA_ASSET) else None
has_intro = intro_path is not None and len(story) > 1
has_cta = cta_path is not None and len(story) > 2

intro_clip = make_avatar_clip(intro_path, 5.0) if has_intro else None
cta_clip = make_avatar_clip(cta_path, 5.0) if has_cta else None
intro_clip = polish_intro_clip(intro_clip, story)
cta_clip = polish_cta_clip(cta_clip, story, topic)

story_start = 1 if has_intro else 0
story_end = len(story) - 1 if has_cta else len(story)
montage_story = story[story_start:story_end]

avatar_duration = 0
if intro_clip is not None:
    avatar_duration += intro_clip.duration
if cta_clip is not None:
    avatar_duration += cta_clip.duration

beat_audio_durations = []
for local_index, item in enumerate(montage_story):
    original_index = story_start + local_index
    audio_path = beat_audio_path(original_index)
    if audio_path:
        audio_clip = AudioFileClip(audio_path)
        beat_audio_durations.append(audio_clip.duration)
        audio_clip.close()
    else:
        beat_audio_durations.append(float(item.get("duration", 4)))

requested_montage_duration = sum(beat_audio_durations)
if requested_montage_duration:
    montage_duration = requested_montage_duration
    beat_durations = beat_audio_durations
else:
    montage_duration = max(8, MAX_DURATION - avatar_duration)
    beat_durations = allocate_story_durations(montage_story, montage_duration)

print(f"Avatar intro: {'yes' if intro_clip is not None else 'no'}")
print(f"Avatar CTA: {'yes' if cta_clip is not None else 'no'}")
print(f"Montage duration: {montage_duration:.2f}s")

clips = []
caption_clips = []
beat_audio_clips = []
voice_timeline_clips = []
current_time = 0

for local_index, item in enumerate(montage_story):
    original_index = story_start + local_index
    clip_path = story_clip_path(original_index)
    audio_path = beat_audio_path(original_index)

    if not clip_path or not os.path.exists(clip_path):
        continue

    try:
        raw_clip = VideoFileClip(clip_path, audio=False)
    except Exception as e:
        print(f"Skipping broken clip: {clip_path}")
        print(e)
        continue

    duration = beat_durations[local_index] if local_index < len(beat_durations) else float(item.get("duration", 4))
    beat_audio = None
    if audio_path:
        beat_audio = AudioFileClip(audio_path).audio_fadein(0.01).audio_fadeout(0.02).volumex(1.25)
        beat_audio_clips.append(beat_audio)
        duration = min(duration, beat_audio.duration)

    clip = make_vertical_clip(raw_clip, duration, local_index)
    if beat_audio is not None:
        voice_timeline_clips.append(
            beat_audio.subclip(0, min(beat_audio.duration, clip.duration)).set_start(current_time)
        )

    clips.append(clip)

    caption = item.get("caption", "")
    if caption:
        caption_clips.append(make_caption(caption, current_time, clip.duration))

    current_time += clip.duration

if not clips:
    raise RuntimeError("No usable montage clips found.")

positioned_clips = []
running_start = 0
for clip in clips:
    positioned_clips.append(clip.set_start(running_start))
    running_start += clip.duration

montage = CompositeVideoClip(positioned_clips, size=(WIDTH, HEIGHT)).set_duration(running_start)
montage = montage.subclip(0, min(montage.duration, montage_duration))

caption_clips = [
    clip for clip in caption_clips
    if clip.start < montage.duration
]

# ── NaomiWorldTourz brand watermark (top-right, every frame) ─────────────────
def make_brand_watermark(duration, topic_text=""):
    is_naomi = any(t in (topic_text or "").lower() for t in ("naomi", "naomiworldtourz", "naomiworld"))
    brand_text = "@NaomiWorldTourz" if is_naomi else "@NaomiWorldTourz"
    wm_w, wm_h = 680, 72
    wm = Image.new("RGBA", (wm_w, wm_h), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wm)
    wm_font_paths = [
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        "arialbd.ttf",
    ]
    wm_font = None
    for fp in wm_font_paths:
        try:
            wm_font = ImageFont.truetype(fp, 34)
            break
        except Exception:
            continue
    if wm_font is None:
        wm_font = ImageFont.load_default()

    # Pill background
    try:
        wd.rounded_rectangle([0, 0, wm_w - 1, wm_h - 1], radius=16, fill=(0, 0, 0, 130))
    except Exception:
        wd.rectangle([0, 0, wm_w - 1, wm_h - 1], fill=(0, 0, 0, 130))
    bbox = wd.textbbox((0, 0), brand_text, font=wm_font)
    tx = (wm_w - (bbox[2] - bbox[0])) / 2
    ty = (wm_h - (bbox[3] - bbox[1])) / 2
    wd.text((tx, ty), brand_text, font=wm_font, fill="#FFD86B", stroke_width=2, stroke_fill=(0, 0, 0, 200))

    wm_arr = np.array(wm)
    return (
        ImageClip(wm_arr)
        .set_duration(duration)
        .set_position((WIDTH - wm_w - 24, 54))
    )

watermark = make_brand_watermark(montage.duration if hasattr(montage, "duration") else 30, topic)

montage = CompositeVideoClip(
    [montage] + caption_clips + [watermark],
    size=(WIDTH, HEIGHT)
).fx(vfx.colorx, 1.08)

montage_audio_layers = []

music = load_music(montage.duration, topic)
if music:
    montage_audio_layers.append(music.set_start(0))

montage_audio_layers.extend(voice_timeline_clips)

if montage_audio_layers:
    montage = montage.set_audio(CompositeAudioClip(montage_audio_layers))

final_parts = []

if intro_clip is not None:
    final_parts.append(intro_clip)

final_parts.append(montage)

if cta_clip is not None:
    final_parts.append(cta_clip)

final_video = concatenate_videoclips(
    final_parts,
    method="compose",
)

if final_video.duration > MAX_DURATION:
    print(
        f"Final reel is {final_video.duration:.2f}s. Keeping full length so the "
        "voiceover is not cut mid-sentence."
    )

def get_render_id():
    try:
        if os.path.exists("render_id.txt"):
            with open("render_id.txt", "r", encoding="utf-8") as f:
                rid = f.read().strip()
                if rid:
                    return rid
    except Exception:
        pass
    return datetime.now().strftime("%Y%m%d_%H%M%S")

render_id = get_render_id()
safe_topic = short_slug(topic)
timestamped_output = f"output/{safe_topic}_reel_{render_id}.mp4"
fixed_output = "output/ai_cinematic_reel.mp4"
final_output = "output/final_subtitled_reel.mp4"

print("\nRendering story-driven 9:16 reel...\n")

video_codec, video_preset, video_bitrate, video_ffmpeg_params = video_encoder_settings()
print(f"Using video encoder: {video_codec}")

try:
    final_video.write_videofile(
        timestamped_output,
        fps=24,
        codec=video_codec,
        audio_codec="aac",
        preset=video_preset,
        bitrate=video_bitrate,
        threads=ENCODER_THREADS,
        ffmpeg_params=video_ffmpeg_params,
    )
except Exception as error:
    if video_codec == "libx264":
        raise

    print(f"GPU encoder failed, retrying with CPU encoder: {error}")
    final_video.write_videofile(
        timestamped_output,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        preset="superfast",
        bitrate="5500k",
        threads=ENCODER_THREADS,
        ffmpeg_params=["-movflags", "+faststart"],
    )

try:
    shutil.copy2(timestamped_output, fixed_output)
except OSError as error:
    print(f"Could not refresh {fixed_output} because it is open: {error}")

try:
    shutil.copy2(timestamped_output, final_output)
except OSError as error:
    print(f"Could not refresh {final_output} because it is open: {error}")

with open("output/latest_video_path.txt", "w", encoding="utf-8") as f:
    f.write(timestamped_output)

print("\nReel saved successfully:")
print(timestamped_output)
print(fixed_output)
print(final_output)
