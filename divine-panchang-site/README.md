# Divine Panchang Site Rebuild

This is a clean static rebuild for the Divine Panchang website, separate from the travel reels app.

## Structure

- `index.html`: main homepage
- `daily-guidance/index.html`: standalone daily guidance landing page
- `styles.css`: shared site styles
- `app.js`: small shared interactions
- `assets/logo-srichakra.svg`: reusable Sri Chakra brand mark
- `assets/favicon.svg`: favicon

## Local Preview

Open the files directly in a browser, or serve the folder:

```powershell
cd "D:\Ai reel Agent\divine-panchang-site"
python -m http.server 4173
```

Then open:

- `http://localhost:4173/`
- `http://localhost:4173/daily-guidance/`

## Cloudflare Pages Deploy

If you want to deploy this to the existing Pages project:

```powershell
cd "D:\Ai reel Agent\divine-panchang-site"
wrangler pages deploy . --project-name divine-compass
```

## Update Before Deploy

- Replace the placeholder Instagram URL in `index.html` and `daily-guidance/index.html`
- If you want to use the exact generated logo PNG later, swap `assets/logo-srichakra.svg`
