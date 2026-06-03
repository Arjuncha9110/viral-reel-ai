import asyncio
import json
import os
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

try:
    import edge_tts
except ModuleNotFoundError:
    edge_tts = None


INTRO_ASSETS = [
    "assets/avatar_intro.mp4",
    "assets/talking_avatar.mp4",
]
CTA_ASSET = "assets/avatar_cta.mp4"
VOICE_BEATS_ROOT = Path("assets/voice_beats")
VOICE_BEATS_DIR = VOICE_BEATS_ROOT / datetime.now().strftime("%Y%m%d_%H%M%S")


def avatar_hook_enabled():
    try:
        return Path("avatar_hook_enabled.txt").read_text(encoding="utf-8").strip() == "1"
    except FileNotFoundError:
        return False


def has_intro_asset():
    return avatar_hook_enabled() and any(os.path.exists(path) for path in INTRO_ASSETS)


def has_cta_asset():
    return avatar_hook_enabled() and os.path.exists(CTA_ASSET)


def pick_voice(style):
    """
    Pick the best Edge TTS voice for the content style.
    Travel / luxury reels -> confident, aspirational female voice (Aria).
    Spiritual / astrology -> warm, calm voice (Jenny).
    Finance / motivation -> punchy, confident voice (Davis).
    """
    style_lower = (style or "").lower()

    # NaomiWorldTourz travel reels -> Aria: confident, aspirational, clear
    if any(t in style_lower for t in ("travel", "luxury", "lifestyle", "naomi")):
        return "en-US-AriaNeural"

    # Spiritual / astrology / panchang -> Jenny: warm, calm, friendly
    if any(t in style_lower for t in ("astrology", "panchang", "spiritual", "horoscope", "vedic", "numerology", "festival")):
        return "en-US-JennyNeural"

    # Finance / trading -> Davis: professional, punchy
    if any(t in style_lower for t in ("finance", "stock", "trading", "market", "motivation")):
        return "en-US-DavisNeural"

    # Default: Aria (clear, confident, good for short-form social content)
    return "en-US-AriaNeural"


def voice_tuning(voice):
    """
    Return (rate, pitch) tuning for each voice persona.
    - Aria (travel/luxury): slightly faster, slight uplift -- confident & aspirational.
    - Jenny (spiritual): moderate rate, natural pitch -- calm & warm.
    - Davis (finance): faster, lower pitch -- punchy & authoritative.
    """
    if "Aria" in voice:
        return "+8%", "+2Hz"      # Confident, aspirational, not rushed
    if "Davis" in voice:
        return "+16%", "-4Hz"     # Punchy finance energy
    return "+10%", "+4Hz"         # Jenny / fallback: warm & clear


async def save_voice(text, output_path, voice):
    if edge_tts is None:
        raise RuntimeError("edge_tts is not installed.")

    rate, pitch = voice_tuning(voice)
    communicate = edge_tts.Communicate(
        text,
        voice=voice,
        rate=rate,
        pitch=pitch,
    )
    await communicate.save(str(output_path))


def save_windows_voice(text, output_path):
    escaped_text = text.replace("'", "''")
    escaped_path = str(output_path).replace("'", "''")
    script = f"""
Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$femaleVoice = $speaker.GetInstalledVoices() |
    ForEach-Object {{ $_.VoiceInfo }} |
    Where-Object {{ $_.Gender -eq 'Female' -or $_.Name -match 'Zira|Jenny|Aria|Female' }} |
    Select-Object -First 1
if ($femaleVoice) {{
    $speaker.SelectVoice($femaleVoice.Name)
}}
$speaker.Rate = 2
$speaker.Volume = 100
$speaker.SetOutputToWaveFile('{escaped_path}')
$speaker.Speak('{escaped_text}')
$speaker.Dispose()
"""
    subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
        check=True,
        capture_output=True,
        text=True,
    )


async def generate_voice_beats(voice_story, voice):
    for item in voice_story:
        text = item["voice"].strip()
        extension = "mp3" if edge_tts is not None else "wav"
        output_path = VOICE_BEATS_DIR / f"beat_{item['story_index'] + 1}.{extension}"

        if edge_tts is not None:
            try:
                await save_voice(text, output_path, voice)
            except Exception as error:
                print(f"Edge voice failed, using local Windows female voice: {error}")
                output_path = VOICE_BEATS_DIR / f"beat_{item['story_index'] + 1}.wav"
                save_windows_voice(text, output_path)
        else:
            save_windows_voice(text, output_path)

        item["audio_path"] = str(output_path).replace("\\", "/")
        print(f"Generated beat voice: {output_path}")


with open("story.json", "r", encoding="utf-8") as f:
    story = json.load(f)

with open("style.txt", "r", encoding="utf-8") as f:
    style = f.read().strip()

start = 1 if has_intro_asset() and len(story) > 1 else 0
end = len(story) - 1 if has_cta_asset() and len(story) > 2 else len(story)

voice_story = []
for story_index, item in enumerate(story[start:end], start=start):
    voice_story.append({
        "story_index": story_index,
        "voice": item["voice"].strip(),
        "caption": item.get("caption", ""),
        "beat": item.get("beat", "story"),
    })

voice = pick_voice(style)

os.makedirs("assets", exist_ok=True)
VOICE_BEATS_DIR.mkdir(parents=True, exist_ok=True)

full_script = "\n".join(item["voice"] for item in voice_story)
with open("assets/voice_script.txt", "w", encoding="utf-8") as f:
    f.write(full_script)

for old_voice_path in ["assets/voice.mp3", "assets/voice.wav"]:
    if os.path.exists(old_voice_path):
        os.remove(old_voice_path)

if voice_story:
    asyncio.run(generate_voice_beats(voice_story, voice))
    first_voice_path = voice_story[0]["audio_path"]
    voice_copy_path = "assets/voice.mp3" if first_voice_path.endswith(".mp3") else "assets/voice.wav"
    shutil.copy2(first_voice_path, voice_copy_path)
else:
    Path("assets/voice.mp3").write_bytes(b"")

with open("assets/voice_manifest.json", "w", encoding="utf-8") as f:
    json.dump(voice_story, f, indent=4)

print("Beat-by-beat voice generated successfully")
if start:
    print("Intro voice skipped because external avatar intro exists.")
if end < len(story):
    print("CTA voice skipped because external avatar CTA exists.")
