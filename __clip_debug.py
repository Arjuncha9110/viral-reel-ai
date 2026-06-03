import json, os
from moviepy.editor import VideoFileClip
with open('assets/clip_manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)
for key, path in manifest.items():
    print('KEY', key, 'EXISTS', os.path.exists(path), 'PATH', path)
    try:
        clip = VideoFileClip(path, audio=False)
        print('  OK duration=', clip.duration, 'size=', clip.size)
        clip.close()
    except Exception as e:
        print('  FAIL', repr(e))
