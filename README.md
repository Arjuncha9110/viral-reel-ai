# AI Reel Agent

A Streamlit app that turns a story brief into a 9:16 reel with generated story beats, voiceover, stock clips, background music, captions, optional avatar clips, and a custom PNG logo overlay.

It now supports both travel-style reels and Divine Panchang style daily astrology/avatar content, including daily guidance, festival explainers, horoscope-style shorts, and numerology themes.

## Run Locally

1. Create a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and add your keys:

```bash
PEXELS_API_KEY=...
PIXABAY_API_KEY=...
OPENAI_API_KEY=...
```

4. Start the app:

```bash
streamlit run app.py
```

## User Logo

Users can upload a PNG logo from the app page. The logo is saved as `assets/logo.png` and used by the video editor in the intro and CTA overlays.

## Cloud Deployment

For Streamlit Community Cloud or a similar hosted Python service:

1. Push the source code to GitHub.
2. Add `PEXELS_API_KEY`, `PIXABAY_API_KEY`, and `OPENAI_API_KEY` in the platform secrets/settings.
3. Keep generated videos, voice files, downloaded clips, and local virtual environments out of Git. The `.gitignore` file already excludes them.
4. Make sure the host supports ffmpeg. `packages.txt` requests ffmpeg on Streamlit Cloud.

## Long-Term Clip Download Fix

If the local app shows placeholder graphics, the issue is usually not the prompt or Pexels key. It means the machine running Python cannot open `api.pexels.com:443`.

Recommended long-term setup:

1. Deploy the app to a cloud host so stock video downloads happen from the cloud, not a Windows desktop network.
2. Store `PEXELS_API_KEY`, `PIXABAY_API_KEY`, and `OPENAI_API_KEY` in cloud secrets, not in source code.
3. Keep `assets/clip_library` as a backup mode for user-uploaded or pre-approved clips.
4. Keep generated media in temporary storage or object storage. Do not commit generated MP4/WAV/MP3 files.

Local Windows fix if you still want auto-downloads on the desktop:

1. Allow `D:\Ai reel Agent\.venv\Scripts\python.exe` through Windows Firewall and antivirus web protection.
2. Allow VS Code, PowerShell/Terminal, and ffmpeg.
3. Restart Streamlit after changing firewall rules.
4. In the app, open "System status" and confirm Pexels is reachable.

For a multi-user product, prefer a hosted backend. Each user can upload their logo and clips from the page, while the server handles prompt generation, clip matching, rendering, and YouTube metadata.

## Optional Assets

Place these files in `assets/` if you want branded/avatar segments:

- `assets/avatar_intro.mp4`
- `assets/avatar_cta.mp4`
- `assets/logo.png`

The app can also accept the logo through the upload field.
