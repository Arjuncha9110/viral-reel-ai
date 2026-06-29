import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Single source of truth for the locked Divine Panchang brand logo.
const lockedLogoSource = path.resolve(__dirname, "public/logo-srichakra.png");
const lockedLogoPublicPath = "/logo-srichakra.png";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: "locked-divine-panchang-logo",
      configureServer(server) {
        server.middlewares.use(lockedLogoPublicPath, (_req, res) => {
          res.setHeader("Content-Type", "image/png");
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          fs.createReadStream(lockedLogoSource).pipe(res);
        });

        // Local development shim for Cloudflare Pages Function
        server.middlewares.use("/api/ai/divine-guidance", async (req, res, next) => {
          if (req.method !== "POST") return next();

          // Collect body
          let body = "";
          req.on("data", chunk => body += chunk.toString());
          req.on("end", async () => {
            try {
              const profile = JSON.parse(body);
              
              // Simulate fallback behavior when no API key is present in local dev
              // Read from Vite's env loaded automatically or process.env
              const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
              
              if (!apiKey) {
                console.log("[vite-dev] Missing ANTHROPIC_API_KEY, using local fallback generator");
                // Import the deterministic logic to simulate the fallback
                const { generateDivineAiGuidance } = await server.ssrLoadModule("/src/lib/divineAiGuidance.ts");
                const fallbackGuidance = generateDivineAiGuidance(profile);
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ status: "fallback", guidance: fallbackGuidance }));
                return;
              }

              // Real Anthropic call for local dev
              console.log("[vite-dev] Calling Anthropic for Divine AI Guidance...");
              const promptText = `
User Profile:
- Name: ${profile.name || "Friend"}
- Goal: ${profile.goal}
- Source Context: ${profile.source || "default"}
- Question: ${profile.question || "None"}`;

              const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                  "x-api-key": apiKey,
                  "anthropic-version": "2023-06-01",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "claude-3-5-haiku-20241022",
                  max_tokens: 800,
                  system: `You are "Divine AI Guru", a personal Vedic companion for a daily panchang and astrology website...
Return ONLY valid JSON matching:
{
  "salutation": "...", "focusTitle": "...", "summary": "...", "doToday": "...", "avoidToday": "...", "mantra": "...", "journalPrompt": "...", "reflection": "...", "followUpPrompts": ["..."], "disclaimer": "..."
}`,
                  messages: [{ role: "user", content: promptText }],
                }),
              });

              if (!anthropicRes.ok) {
                res.statusCode = 500;
                res.end(await anthropicRes.text());
                return;
              }

              const data = await anthropicRes.json();
              const contentText = data.content?.[0]?.text || "";
              const jsonStr = contentText.includes("{") ? contentText.substring(contentText.indexOf("{"), contentText.lastIndexOf("}") + 1) : contentText;
              
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ status: "success", guidance: JSON.parse(jsonStr) }));

            } catch (err) {
              console.error("[vite-dev] Error in mock endpoint:", err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });
      },
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "logo-srichakra.png",
          source: fs.readFileSync(lockedLogoSource),
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  // Explicitly forward Cloudflare Pages process.env VITE_* variables
  // into import.meta.env so they are baked into the production bundle.
  define: {
    "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(process.env.VITE_FIREBASE_API_KEY || ""),
    "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN || ""),
    "import.meta.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID || ""),
    "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET || ""),
    "import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ""),
    "import.meta.env.VITE_FIREBASE_APP_ID": JSON.stringify(process.env.VITE_FIREBASE_APP_ID || ""),
    "import.meta.env.VITE_FIREBASE_MEASUREMENT_ID": JSON.stringify(process.env.VITE_FIREBASE_MEASUREMENT_ID || ""),
    "import.meta.env.VITE_GOOGLE_MAPS_API_KEY": JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY || ""),
    "import.meta.env.VITE_ENABLE_PAYMENT_BYPASS": JSON.stringify(process.env.VITE_ENABLE_PAYMENT_BYPASS || "false"),
  },
  build: {
    emptyOutDir: true,
    reportCompressedSize: false,
  },
}));
