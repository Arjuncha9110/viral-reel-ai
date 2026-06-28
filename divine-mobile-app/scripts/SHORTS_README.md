# Daily Panchang Shorts — script generator

Generates a complete, ready-to-record YouTube Shorts script from the same
panchang engine the website uses. English, value-first with a light site CTA.

## Run it

```
npm run shorts                  # today, Bengaluru
npm run shorts -- mumbai        # today, Mumbai
npm run shorts -- delhi 2026-06-25   # specific city + date
```

Cities: `delhi`, `mumbai`, `bengaluru`, `kolkata`, `chennai`, `hyderabad`, `pune`, `varanasi`

## What it prints

- **Title** — paste into YouTube
- **Hook** — first 3 seconds (the most important part for watch time)
- **7 on-screen text cards** — one per beat
- **Voiceover** (~35s) — paste into ElevenLabs for the audio
- **CTA** — light mention of divinepanchang.space
- **Caption + hashtags** — paste under the Short

## Daily workflow (about 10 min once you have a template)

1. `npm run shorts` → copy the output
2. Paste the **Voiceover** block into ElevenLabs → download the audio
3. In your editor (Canva / CapCut), drop the 7 **on-screen cards** over a fixed
   background template, lay the audio on top
4. Export vertical (1080x1920), post with the **Title**, **Caption**, **Hashtags**
5. Repeat daily — consistency is what grows the channel

## Tip: pick one city as your "home" channel

Posting one city's panchang daily (e.g. Delhi or Mumbai for biggest audience)
beats spreading across many. You can spin up extra city variants later once the
format is working.
