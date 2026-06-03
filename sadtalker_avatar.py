import shutil
import subprocess
from pathlib import Path


SADTALKER_DIR = Path(r"D:\Ai avatar agent\SadTalker")
SADTALKER_PYTHON = SADTALKER_DIR / "venv" / "Scripts" / "python.exe"

VOICE = Path(r"D:\Ai reel Agent\assets\voice.mp3")
AVATAR = Path(r"D:\Ai reel Agent\inputs\avatar.png")
RESULT_DIR = Path(r"D:\Ai reel Agent\assets\sadtalker_results")
FINAL_AVATAR_VIDEO = Path(r"D:\Ai reel Agent\assets\talking_avatar.mp4")

RESULT_DIR.mkdir(parents=True, exist_ok=True)

if not SADTALKER_PYTHON.exists():
    raise FileNotFoundError(f"SadTalker Python not found: {SADTALKER_PYTHON}")

if not VOICE.exists():
    raise FileNotFoundError(f"Voice file not found: {VOICE}")

if not AVATAR.exists():
    raise FileNotFoundError(f"Avatar image not found: {AVATAR}")

cmd = [
    str(SADTALKER_PYTHON),
    "inference.py",
    "--driven_audio", str(VOICE),
    "--source_image", str(AVATAR),
    "--result_dir", str(RESULT_DIR),
    "--still",
    "--size", "256",
    "--preprocess", "extfull",
]

subprocess.run(cmd, cwd=str(SADTALKER_DIR), check=True)

videos = sorted(
    RESULT_DIR.rglob("*.mp4"),
    key=lambda p: p.stat().st_mtime,
    reverse=True,
)

if not videos:
    raise FileNotFoundError("SadTalker did not create an mp4.")

shutil.copy2(videos[0], FINAL_AVATAR_VIDEO)

print(f"Talking avatar saved to {FINAL_AVATAR_VIDEO}")
