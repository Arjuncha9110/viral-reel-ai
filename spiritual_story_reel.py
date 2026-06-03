"""
Spiritual Story Reel Generator — All 9 Navagraha Planets
Supports: Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu, Ketu
Usage: python spiritual_story_reel.py --planet shani
       (or called by app.py with planet arg)
"""
import argparse
import asyncio
import os
import random
import sys
from pathlib import Path

import edge_tts
import numpy as np
from moviepy.editor import (
    AudioFileClip,
    CompositeAudioClip,
    CompositeVideoClip,
    ImageClip,
    concatenate_audioclips,
    concatenate_videoclips,
)
from PIL import Image, ImageDraw, ImageFilter, ImageFont

if not hasattr(Image, "ANTIALIAS"):
    Image.ANTIALIAS = Image.Resampling.LANCZOS

WIDTH = 1080
HEIGHT = 1920
FPS = 24
ASSETS = Path("assets")
OUTPUT = Path("output")
VOICE_PATH = ASSETS / "spiritual_voice.mp3"

SERIF = r"C:\Windows\Fonts\georgiab.ttf"
BOLD = r"C:\Windows\Fonts\arialbd.ttf"
UI = r"C:\Windows\Fonts\segoeuib.ttf"

# ─────────────────────────────────────────────
# 9 PLANET DATA: stories, palettes, character images
# ─────────────────────────────────────────────
PLANETS = {
    "surya": {
        "name": "Surya",
        "label": "☀️ Surya (Sun)",
        "character_image": "assets/surya_character.png",
        "voice_style": "en-US-GuyNeural",
        "voice_rate": "-2%",
        "voice_pitch": "+2Hz",
        "accent_color": "#FFD700",
        "palettes": {
            "dawn":   ((28, 14, 6),   (110, 58, 14),  (255, 200, 80)),
            "solar":  ((20, 10, 4),   (90, 44, 8),    (255, 160, 40)),
            "gold":   ((18, 12, 7),   (75, 50, 18),   (255, 214, 112)),
            "royal":  ((14, 10, 24),  (60, 40, 10),   (255, 220, 100)),
            "flame":  ((22, 8, 4),    (88, 30, 8),    (255, 130, 40)),
            "crown":  ((16, 10, 6),   (68, 46, 12),   (240, 200, 80)),
        },
        "story": [
            {"duration": 3.2, "title": "SURYA SPEAKS", "scene": "dawn",
             "voice": "Every morning the Sun rises without being asked. That is discipline without applause.",
             "caption": "RISE WITHOUT APPLAUSE"},
            {"duration": 4.0, "title": "YOUR EGO BLOCKS YOU", "scene": "solar",
             "voice": "Surya teaches that ego burns everything around it. Confidence lights the path. Learn the difference.",
             "caption": "EGO BURNS. LIGHT GUIDES."},
            {"duration": 4.0, "title": "STAND IN YOUR POWER", "scene": "gold",
             "voice": "You do not need permission to shine. The Sun never asks if today is a good day to rise.",
             "caption": "NO PERMISSION NEEDED"},
            {"duration": 4.2, "title": "LEADERSHIP IS SERVICE", "scene": "royal",
             "voice": "True power under Surya is not domination. It is illuminating others so they can find their own path.",
             "caption": "LIGHT OTHERS UP"},
            {"duration": 4.0, "title": "HEALTH IS WEALTH", "scene": "flame",
             "voice": "Surya rules your vitality. If your body is tired, your purpose cannot move. Protect your energy first.",
             "caption": "PROTECT YOUR ENERGY"},
            {"duration": 3.8, "title": "SAVE THIS", "scene": "crown",
             "voice": "Save this if Surya reminded you who you are today.",
             "caption": "SAVE THIS REMINDER"},
        ],
    },

    "chandra": {
        "name": "Chandra",
        "label": "🌙 Chandra (Moon)",
        "character_image": "assets/chandra_character.png",
        "voice_style": "en-US-JennyNeural",
        "voice_rate": "-6%",
        "voice_pitch": "-3Hz",
        "accent_color": "#C8E8FF",
        "palettes": {
            "midnight": ((6, 8, 22),   (18, 24, 56),   (160, 200, 255)),
            "silver":   ((8, 10, 26),   (22, 28, 60),   (200, 220, 255)),
            "tide":     ((6, 12, 28),   (20, 34, 70),   (140, 190, 255)),
            "dream":    ((8, 8, 28),    (24, 22, 68),   (180, 200, 255)),
            "calm":     ((7, 10, 24),   (20, 26, 58),   (170, 210, 255)),
            "pearl":    ((9, 10, 30),   (26, 28, 68),   (200, 225, 255)),
        },
        "story": [
            {"duration": 3.2, "title": "CHANDRA SPEAKS", "scene": "midnight",
             "voice": "The Moon does not apologize for changing. It is the only way it stays whole.",
             "caption": "CHANGE IS WHOLENESS"},
            {"duration": 4.0, "title": "YOUR EMOTIONS ARE DATA", "scene": "silver",
             "voice": "Chandra rules your mind and emotions. Feeling deeply is not weakness. It is information. Learn to read it.",
             "caption": "FEEL DEEPLY, READ IT"},
            {"duration": 4.0, "title": "THE TIDE ALWAYS RETURNS", "scene": "tide",
             "voice": "When everything feels low, remember. The Moon at its darkest is three days from being full again.",
             "caption": "THE FULL MOON RETURNS"},
            {"duration": 4.2, "title": "MOTHER ENERGY", "scene": "dream",
             "voice": "Chandra is the energy of nurturing. Give yourself the care you give to everyone else without hesitation.",
             "caption": "NURTURE YOURSELF TOO"},
            {"duration": 4.0, "title": "SLEEP IS SACRED", "scene": "calm",
             "voice": "Chandra governs rest, dreams, and the subconscious. What you heal at night transforms your day.",
             "caption": "HEAL WHILE YOU SLEEP"},
            {"duration": 3.8, "title": "SAVE THIS", "scene": "pearl",
             "voice": "Save this if Chandra is reminding you to be gentle with yourself today.",
             "caption": "BE GENTLE WITH YOU"},
        ],
    },

    "mangal": {
        "name": "Mangal",
        "label": "🔴 Mangal (Mars)",
        "character_image": "assets/mangal_character.png",
        "voice_style": "en-US-GuyNeural",
        "voice_rate": "+4%",
        "voice_pitch": "+3Hz",
        "accent_color": "#FF4422",
        "palettes": {
            "battle":   ((22, 6, 6),   (90, 22, 16),   (255, 80, 40)),
            "fire":     ((22, 8, 4),   (92, 28, 16),   (255, 100, 50)),
            "warrior":  ((18, 6, 4),   (80, 20, 12),   (255, 90, 45)),
            "rage":     ((20, 6, 4),   (88, 24, 14),   (255, 70, 35)),
            "strength": ((18, 8, 4),   (84, 26, 14),   (255, 110, 55)),
            "victory":  ((20, 6, 4),   (86, 22, 12),   (255, 160, 60)),
        },
        "story": [
            {"duration": 3.2, "title": "MANGAL SPEAKS", "scene": "battle",
             "voice": "Mars does not wait. It acts. Stop planning what you will do someday. Someday is a trap.",
             "caption": "STOP WAITING. ACT NOW."},
            {"duration": 4.0, "title": "ANGER IS FUEL", "scene": "fire",
             "voice": "Mangal rules anger and drive. Anger misused destroys. Anger channeled into action builds empires.",
             "caption": "CHANNEL YOUR FIRE"},
            {"duration": 4.0, "title": "COURAGE IS A MUSCLE", "scene": "warrior",
             "voice": "Every time you do the hard thing when you do not want to, you become the warrior Mangal intended.",
             "caption": "DO THE HARD THING"},
            {"duration": 4.2, "title": "PROTECT YOUR ENERGY", "scene": "rage",
             "voice": "Mangal says this clearly. Stop fighting battles that do not belong to you. Reserve your fire for your purpose.",
             "caption": "FIGHT FOR YOUR PURPOSE"},
            {"duration": 4.0, "title": "MOVE THE BODY", "scene": "strength",
             "voice": "Mangal governs physical energy. A stagnant body creates a stagnant mind. Move. Sweat. Show up.",
             "caption": "MOVE YOUR BODY"},
            {"duration": 3.8, "title": "SAVE THIS", "scene": "victory",
             "voice": "Save this if Mangal is waking the warrior inside you today.",
             "caption": "WAKE THE WARRIOR"},
        ],
    },

    "budh": {
        "name": "Budh",
        "label": "💚 Budh (Mercury)",
        "character_image": "assets/budh_character.png",
        "voice_style": "en-US-GuyNeural",
        "voice_rate": "+2%",
        "voice_pitch": "+1Hz",
        "accent_color": "#44FF88",
        "palettes": {
            "emerald":  ((6, 18, 12),  (18, 56, 34),   (80, 220, 130)),
            "intellect":((8, 16, 10),  (20, 50, 28),   (100, 200, 120)),
            "quick":    ((6, 14, 10),  (16, 44, 26),   (90, 210, 140)),
            "mind":     ((7, 16, 11),  (18, 48, 30),   (85, 215, 135)),
            "logic":    ((6, 18, 12),  (18, 52, 32),   (95, 205, 125)),
            "mercury":  ((8, 18, 12),  (22, 54, 34),   (110, 225, 145)),
        },
        "story": [
            {"duration": 3.2, "title": "BUDH SPEAKS", "scene": "emerald",
             "voice": "Mercury moves fastest. Your mind follows. Master your thinking and you master your outcomes.",
             "caption": "MASTER YOUR MIND"},
            {"duration": 4.0, "title": "WORDS CREATE WORLDS", "scene": "intellect",
             "voice": "Budh governs communication. The words you speak to yourself every day are building your reality right now.",
             "caption": "WATCH YOUR WORDS"},
            {"duration": 4.0, "title": "LEARN SOMETHING DAILY", "scene": "quick",
             "voice": "Mercury rewards curiosity. The person who stops learning stops growing. Feed your intellect daily.",
             "caption": "NEVER STOP LEARNING"},
            {"duration": 4.2, "title": "ADAPTABILITY WINS", "scene": "mind",
             "voice": "Budh is never rigid. The most intelligent response to change is not resistance. It is adaptation.",
             "caption": "ADAPT AND WIN"},
            {"duration": 4.0, "title": "SPEAK WITH INTENTION", "scene": "logic",
             "voice": "Mercury says this. Before you speak, ask. Is it true? Is it kind? Does it move things forward?",
             "caption": "SPEAK WITH PURPOSE"},
            {"duration": 3.8, "title": "SAVE THIS", "scene": "mercury",
             "voice": "Save this if Budh is sharpening your mind today.",
             "caption": "SHARPEN YOUR MIND"},
        ],
    },

    "guru": {
        "name": "Guru",
        "label": "🟡 Guru (Jupiter)",
        "character_image": "assets/guru_character.png",
        "voice_style": "en-US-GuyNeural",
        "voice_rate": "-4%",
        "voice_pitch": "-2Hz",
        "accent_color": "#FFE066",
        "palettes": {
            "wisdom":   ((12, 14, 28),  (40, 38, 70),  (220, 200, 100)),
            "blessings":((14, 12, 24),  (44, 36, 68),  (230, 210, 110)),
            "dharma":   ((10, 14, 26),  (36, 38, 68),  (210, 195, 95)),
            "expand":   ((12, 14, 28),  (40, 40, 72),  (225, 205, 105)),
            "grace":    ((14, 14, 28),  (42, 38, 70),  (220, 200, 100)),
            "jupiter":  ((12, 12, 26),  (38, 36, 68),  (215, 195, 95)),
        },
        "story": [
            {"duration": 3.2, "title": "GURU SPEAKS", "scene": "wisdom",
             "voice": "Jupiter expands whatever it touches. If you expand wisdom, it multiplies. If you expand ego, it destroys.",
             "caption": "EXPAND WITH WISDOM"},
            {"duration": 4.0, "title": "GRATITUDE OPENS DOORS", "scene": "blessings",
             "voice": "Guru rules abundance. But abundance never enters a closed, ungrateful heart. Begin with what you have.",
             "caption": "GRATITUDE FIRST"},
            {"duration": 4.0, "title": "TEACH TO GROW", "scene": "dharma",
             "voice": "The fastest path to mastery is teaching. When you share what you know, Jupiter multiplies it back to you.",
             "caption": "SHARE WHAT YOU KNOW"},
            {"duration": 4.2, "title": "DHARMA IS YOUR PATH", "scene": "expand",
             "voice": "Guru says. Your purpose and your values must align. When you live in dharma, blessings stop being coincidences.",
             "caption": "LIVE IN YOUR DHARMA"},
            {"duration": 4.0, "title": "PATIENCE BRINGS PLENTY", "scene": "grace",
             "voice": "Jupiter moves slowly because real abundance is built over years, not days. Trust the timeline you cannot see.",
             "caption": "TRUST THE TIMELINE"},
            {"duration": 3.8, "title": "SAVE THIS", "scene": "jupiter",
             "voice": "Save this if Guru is expanding your perspective today.",
             "caption": "EXPAND YOUR VISION"},
        ],
    },

    "shukra": {
        "name": "Shukra",
        "label": "✨ Shukra (Venus)",
        "character_image": "assets/shukra_character.png",
        "voice_style": "en-US-JennyNeural",
        "voice_rate": "-4%",
        "voice_pitch": "+2Hz",
        "accent_color": "#FF88CC",
        "palettes": {
            "rose":    ((22, 8, 16),   (72, 24, 48),   (255, 140, 190)),
            "love":    ((20, 6, 14),   (68, 20, 44),   (255, 120, 180)),
            "luxury":  ((18, 8, 14),   (64, 22, 42),   (255, 130, 185)),
            "beauty":  ((22, 8, 18),   (74, 26, 50),   (255, 150, 195)),
            "venus":   ((20, 8, 16),   (70, 24, 46),   (255, 135, 188)),
            "silk":    ((18, 6, 14),   (66, 20, 44),   (255, 125, 182)),
        },
        "story": [
            {"duration": 3.2, "title": "SHUKRA SPEAKS", "scene": "rose",
             "voice": "Venus teaches that beauty is not vanity. It is how you show the world that you value existence.",
             "caption": "BEAUTY IS SACRED"},
            {"duration": 4.0, "title": "YOU ATTRACT WHAT YOU ARE", "scene": "love",
             "voice": "Shukra rules attraction. The love, the wealth, the life you want — it comes when you become the version that matches it.",
             "caption": "BECOME WHAT YOU SEEK"},
            {"duration": 4.0, "title": "PLEASURE IS NOT GUILT", "scene": "luxury",
             "voice": "Venus does not punish joy. Denying beauty and pleasure blocks abundance. Allow yourself to receive.",
             "caption": "ALLOW YOURSELF TO RECEIVE"},
            {"duration": 4.2, "title": "RELATIONSHIPS ARE MIRRORS", "scene": "beauty",
             "voice": "Shukra shows you yourself through others. Every relationship reveals where you need to grow or heal.",
             "caption": "WHAT DO THEY REFLECT?"},
            {"duration": 4.0, "title": "CREATE SOMETHING", "scene": "venus",
             "voice": "Venus rules art, music, beauty, and creation. If you are not creating, a part of Shukra inside you is sleeping.",
             "caption": "CREATE EVERY DAY"},
            {"duration": 3.8, "title": "SAVE THIS", "scene": "silk",
             "voice": "Save this if Shukra is reminding you that you deserve beauty and love today.",
             "caption": "YOU DESERVE THIS"},
        ],
    },

    "shani": {
        "name": "Shani",
        "label": "⚫ Shani (Saturn)",
        "character_image": "assets/shani_character.png",
        "voice_style": "en-US-GuyNeural",
        "voice_rate": "-4%",
        "voice_pitch": "-5Hz",
        "accent_color": "#A0B8FF",
        "palettes": {
            "cosmic":  ((8, 18, 42),   (46, 32, 82),   (202, 165, 77)),
            "fire":    ((22, 8, 16),   (92, 36, 22),   (255, 160, 62)),
            "temple":  ((12, 18, 24),  (45, 50, 34),   (203, 183, 112)),
            "saturn":  ((7, 10, 25),   (28, 31, 70),   (160, 198, 255)),
            "storm":   ((9, 12, 24),   (36, 45, 58),   (130, 168, 210)),
            "gold":    ((18, 12, 7),   (75, 50, 18),   (255, 214, 112)),
        },
        "story": [
            {"duration": 3.2, "title": "SHANI'S ADVICE", "scene": "cosmic",
             "voice": "If life keeps getting harder, maybe Shani is not punishing you.",
             "caption": "LIFE GETTING HARDER?"},
            {"duration": 4.2, "title": "PRESSURE BUILDS POWER", "scene": "fire",
             "voice": "Iron is heated before it becomes a weapon. Pressure creates diamonds.",
             "caption": "PRESSURE BUILDS POWER"},
            {"duration": 4.2, "title": "DELAYS TEACH PATIENCE", "scene": "temple",
             "voice": "Every delay teaches patience. Every failure removes arrogance.",
             "caption": "DELAYS ARE TRAINING"},
            {"duration": 4.4, "title": "THE LONG ROAD", "scene": "saturn",
             "voice": "Shani takes the long road, the painful road, the road that builds discipline.",
             "caption": "DISCIPLINE OVER COMFORT"},
            {"duration": 4.0, "title": "ASK THIS", "scene": "storm",
             "voice": "Do not ask, why me? Ask, what strength is this pain awakening inside me?",
             "caption": "WHAT IS THIS TEACHING?"},
            {"duration": 3.8, "title": "SAVE THIS", "scene": "gold",
             "voice": "Save this if you needed this reminder today.",
             "caption": "SAVE THIS REMINDER"},
        ],
    },

    "rahu": {
        "name": "Rahu",
        "label": "🌑 Rahu (North Node)",
        "character_image": "assets/rahu_character.png",
        "voice_style": "en-US-GuyNeural",
        "voice_rate": "-2%",
        "voice_pitch": "-8Hz",
        "accent_color": "#8844FF",
        "palettes": {
            "shadow":  ((8, 4, 18),    (30, 14, 60),   (140, 80, 255)),
            "illusion":((10, 4, 20),   (34, 16, 66),   (160, 90, 255)),
            "desire":  ((8, 4, 16),    (28, 12, 58),   (130, 75, 245)),
            "eclipse": ((6, 4, 18),    (26, 12, 56),   (120, 70, 240)),
            "smoke":   ((8, 6, 18),    (30, 16, 60),   (145, 85, 250)),
            "rahu":    ((10, 4, 20),   (34, 14, 64),   (155, 88, 252)),
        },
        "story": [
            {"duration": 3.2, "title": "RAHU SPEAKS", "scene": "shadow",
             "voice": "Rahu is the force of obsession, ambition, and desire. It will give you everything you want. Then show you what you missed.",
             "caption": "BE CAREFUL WHAT YOU CHASE"},
            {"duration": 4.0, "title": "DESIRE IS A TEACHER", "scene": "illusion",
             "voice": "Rahu says this. Chase the goal. But never let the goal become your identity. You are more than what you want.",
             "caption": "YOU ARE MORE THAN GOALS"},
            {"duration": 4.0, "title": "ILLUSIONS WILL FALL", "scene": "desire",
             "voice": "Everything Rahu builds that is not rooted in truth, it will eventually dismantle. Let it. Truth is safer.",
             "caption": "LET ILLUSIONS GO"},
            {"duration": 4.2, "title": "FOREIGN = GROWTH", "scene": "eclipse",
             "voice": "Rahu rules the unfamiliar. The discomfort you feel stepping into new territory is Rahu doing its work.",
             "caption": "DISCOMFORT = GROWTH"},
            {"duration": 4.0, "title": "BREAK THE PATTERN", "scene": "smoke",
             "voice": "Rahu forces evolution. If the same situation keeps appearing in your life, it is waiting for a different response.",
             "caption": "RESPOND DIFFERENTLY"},
            {"duration": 3.8, "title": "SAVE THIS", "scene": "rahu",
             "voice": "Save this if Rahu is pushing you toward something you are afraid to want.",
             "caption": "DARE TO WANT IT"},
        ],
    },

    "ketu": {
        "name": "Ketu",
        "label": "🔮 Ketu (South Node)",
        "character_image": "assets/ketu_character.png",
        "voice_style": "en-US-GuyNeural",
        "voice_rate": "-6%",
        "voice_pitch": "-6Hz",
        "accent_color": "#AAFFDD",
        "palettes": {
            "void":       ((4, 14, 10),   (14, 40, 28),  (100, 220, 170)),
            "moksha":     ((4, 12, 10),   (12, 36, 26),  (90, 210, 160)),
            "detach":     ((6, 14, 10),   (16, 40, 28),  (110, 225, 175)),
            "past":       ((4, 14, 10),   (14, 38, 26),  (95, 215, 165)),
            "liberation": ((6, 14, 12),   (16, 42, 30),  (105, 220, 172)),
            "ketu":       ((4, 12, 10),   (14, 40, 28),  (100, 218, 168)),
        },
        "story": [
            {"duration": 3.2, "title": "KETU SPEAKS", "scene": "void",
             "voice": "Ketu is the planet of letting go. What you are clinging to is exactly what is blocking your next level.",
             "caption": "LET IT GO NOW"},
            {"duration": 4.0, "title": "PAST LIVES SPEAK", "scene": "moksha",
             "voice": "Ketu carries the wisdom of what your soul has already mastered. Trust your instincts. They are ancient.",
             "caption": "TRUST YOUR INSTINCTS"},
            {"duration": 4.0, "title": "NOTHING IS PERMANENT", "scene": "detach",
             "voice": "Ketu teaches impermanence. The tighter you hold what is passing, the more it hurts when it leaves.",
             "caption": "HOLD THINGS LIGHTLY"},
            {"duration": 4.2, "title": "DETACHMENT IS POWER", "scene": "past",
             "voice": "Ketu does not mean you do not care. It means you are not controlled by outcomes. That is real freedom.",
             "caption": "DETACH. THEN ACT."},
            {"duration": 4.0, "title": "MOKSHA IS THE GOAL", "scene": "liberation",
             "voice": "Ketu points toward liberation. Every time you release an attachment, you take one step closer to your own peace.",
             "caption": "RELEASE = FREEDOM"},
            {"duration": 3.8, "title": "SAVE THIS", "scene": "ketu",
             "voice": "Save this if Ketu is asking you to release something today.",
             "caption": "WHAT MUST YOU RELEASE?"},
        ],
    },
}

PLANET_LIST = list(PLANETS.keys())
PLANET_LABELS = {k: v["label"] for k, v in PLANETS.items()}


# ─────────────────────────────────────────────
# RENDERING ENGINE
# ─────────────────────────────────────────────

def font_load(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def fit_text(draw, text, font_path, max_width, start_size, min_size=28):
    size = start_size
    while size >= min_size:
        f = font_load(font_path, size)
        box = draw.textbbox((0, 0), text, font=f)
        if box[2] - box[0] <= max_width:
            return f
        size -= 4
    return font_load(font_path, min_size)


def center_text(draw, text, y, f, fill, stroke_width=4):
    box = draw.textbbox((0, 0), text, font=f, stroke_width=stroke_width)
    x = (WIDTH - (box[2] - box[0])) / 2
    draw.text((x, y), text, font=f, fill=fill,
              stroke_width=stroke_width, stroke_fill=(0, 0, 0, 210))


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    try:
        draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)
    except Exception:
        draw.rectangle(box, fill=fill, outline=outline, width=width)


def gradient_background(planet_data, scene_name):
    palettes = planet_data["palettes"]
    top, bottom, accent = palettes.get(scene_name, list(palettes.values())[0])

    img = Image.new("RGB", (WIDTH, HEIGHT), "#07101f")
    pix = img.load()
    for y in range(HEIGHT):
        t = y / HEIGHT
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        for x in range(WIDTH):
            pix[x, y] = (r, g, b)

    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for _ in range(28):
        x = random.randint(-180, WIDTH + 180)
        y = random.randint(-180, HEIGHT + 180)
        radius = random.randint(80, 240)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius),
                     fill=(*accent, random.randint(10, 38)))
    for _ in range(90):
        x = random.randint(0, WIDTH)
        y = random.randint(0, HEIGHT)
        draw.ellipse((x, y, x + 3, y + 3),
                     fill=(255, 224, 145, random.randint(35, 100)))

    return Image.alpha_composite(img.convert("RGBA"), overlay).filter(ImageFilter.GaussianBlur(0.6))


def accent_hex_to_rgb(hex_color):
    h = hex_color.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def make_frame(planet_data, scene, index):
    bg = gradient_background(planet_data, scene["scene"])

    char_path = Path(planet_data["character_image"])
    if char_path.exists():
        char = Image.open(char_path).convert("RGBA")
        char.thumbnail((850, 1300), Image.Resampling.LANCZOS)
        positions = [
            (int((WIDTH - char.width) / 2),      438),
            (int((WIDTH - char.width) / 2) - 50,  470),
            (int((WIDTH - char.width) / 2) + 58,  445),
            (int((WIDTH - char.width) / 2),       500),
            (int((WIDTH - char.width) / 2) - 30,  430),
            (int((WIDTH - char.width) / 2),       440),
        ]
        x, y = positions[index % len(positions)]
        shadow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        ImageDraw.Draw(shadow).ellipse((180, 1420, 900, 1640), fill=(0, 0, 0, 90))
        bg = Image.alpha_composite(bg, shadow.filter(ImageFilter.GaussianBlur(36)))
        bg.alpha_composite(char, (x, y))

    accent = accent_hex_to_rgb(planet_data["accent_color"])
    accent_with_alpha = (*accent, 230)

    draw = ImageDraw.Draw(bg)

    # Planet name badge top-left
    planet_label = planet_data["name"].upper()
    badge_font = fit_text(draw, planet_label, UI, 300, 36, 26)
    rounded_rect(draw, (48, 52, 340, 114), 24, (0, 0, 0, 180), (*accent, 200), 2)
    draw.text((72, 66), planet_label, font=badge_font, fill=planet_data["accent_color"])

    # Title card
    title = scene["title"].upper()
    title_font = fit_text(draw, title, SERIF, 830, 78, 42)
    title_box = draw.textbbox((0, 0), title, font=title_font)
    title_w = title_box[2] - title_box[0]
    title_card = ((WIDTH - title_w) / 2 - 52, 128, (WIDTH + title_w) / 2 + 52, 238)
    rounded_rect(draw, title_card, 34, (0, 0, 0, 214), accent_with_alpha, 3)
    center_text(draw, title, 146, title_font, "#FFFFFF", stroke_width=4)

    # Caption bar
    caption = scene["caption"].upper()
    caption_font = fit_text(draw, caption, BOLD, 850, 68, 38)
    rounded_rect(draw, (86, 1514, WIDTH - 86, 1688), 44, (0, 0, 0, 194), (*accent, 210), 3)
    center_text(draw, caption, 1560, caption_font, planet_data["accent_color"], stroke_width=5)

    # Follow line
    small_font = fit_text(draw, "FOLLOW FOR DAILY GUIDANCE", UI, 700, 34, 24)
    center_text(draw, "FOLLOW FOR DAILY GUIDANCE", 1710, small_font, "#F8E6A5", stroke_width=2)

    return bg.convert("RGB")


async def generate_voice_async(planet_data, story):
    text = " ".join(s["voice"] for s in story)
    communicate = edge_tts.Communicate(
        text,
        planet_data["voice_style"],
        rate=planet_data["voice_rate"],
        pitch=planet_data["voice_pitch"],
    )
    await communicate.save(str(VOICE_PATH))


def render_planet_reel(planet_key):
    planet_data = PLANETS[planet_key]
    story = planet_data["story"]

    OUTPUT.mkdir(exist_ok=True)
    ASSETS.mkdir(exist_ok=True)

    char_path = Path(planet_data["character_image"])
    if not char_path.exists():
        print(f"WARNING: Character image not found at {char_path}. Rendering without character.")

    print(f"Generating voice for {planet_data['name']}...")
    asyncio.run(generate_voice_async(planet_data, story))

    print("Building scenes...")
    clips = []
    for index, scene in enumerate(story):
        frame = make_frame(planet_data, scene, index)
        clip = ImageClip(np.array(frame)).set_duration(scene["duration"])
        direction = -1 if index % 2 else 1
        clip = clip.resize(lambda t: 1 + 0.018 * t)
        clip = clip.set_position(lambda t, d=direction: (d * 14 * t - 28, 0))
        clip = CompositeVideoClip([clip], size=(WIDTH, HEIGHT)).set_duration(scene["duration"])
        clip = clip.fadein(0.18).fadeout(0.16)
        clips.append(clip)

    video = concatenate_videoclips(clips, method="compose", padding=-0.05)
    voice = AudioFileClip(str(VOICE_PATH)).volumex(1.15)
    voice = voice.subclip(0, min(voice.duration, video.duration))

    music = None
    for candidate in [ASSETS / "music.mp3", Path("music/cinematic.mp3")]:
        if candidate.exists():
            music = AudioFileClip(str(candidate)).volumex(0.13)
            if music.duration < video.duration:
                loops = int(video.duration // music.duration) + 1
                music = concatenate_audioclips([music] * loops)
            music = music.subclip(0, video.duration).audio_fadein(0.4).audio_fadeout(0.8)
            break

    video = video.set_audio(CompositeAudioClip([music, voice]) if music else voice)

    out_path = OUTPUT / f"spiritual_{planet_key}_reel.mp4"
    print(f"Rendering {planet_data['name']} reel...")
    video.write_videofile(
        str(out_path),
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        preset="superfast",
        bitrate="5200k",
        threads=4,
    )
    # Also write latest path for app.py preview
    Path("output/latest_spiritual_path.txt").write_text(str(out_path), encoding="utf-8")
    print(f"Saved: {out_path}")
    return str(out_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--planet", default="shani",
                        choices=PLANET_LIST,
                        help="Planet to render reel for")
    args = parser.parse_args()
    render_planet_reel(args.planet)
