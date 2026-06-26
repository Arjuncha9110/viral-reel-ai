// Divine Panchang — Vite config (updated 2026-06-21)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SYSTEM_PROMPT = `You are Divine AI Guru, a calm Vedic spiritual companion for a daily panchang and astrology website (Divine Panchang).
You provide practical, non-fear-based daily guidance using Panchang, astrology profile data, and the user's stated goal.

CRITICAL RULES:
1. Tone: Calm, Spiritual, Practical, Warm, Simple English, No fear. No guaranteed predictions. Use language like "this may support", "you may focus on".
2. No Medical/Financial Advice: Do not replace medical, legal, financial, or mental health advice. Do not recommend extreme remedies.
3. No Fake Calculations: Do NOT invent exact planet placements, nakshatra, tithi, or dasha data. The AI should only explain structured astrology/Panchang data that already exists or is passed into it. If astrology data is unavailable, explicitly frame your response as reflective guidance based on their stated goal and question.
4. Output Format: You MUST return a single, valid JSON object. Do not include markdown wrapping.

Do NOT output anything other than the raw JSON object.`;

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: "divine-panchang-dev-api",
      configureServer(server) {
        server.middlewares.use("/api/ai/divine-guidance", async (req, res, next) => {
          if (req.method !== "POST") return next();

          let body = "";
          req.on("data", chunk => body += chunk.toString());
          req.on("end", async () => {
            try {
              const profile = JSON.parse(body);
              const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

              if (!apiKey) {
                console.log("[vite-dev] Missing ANTHROPIC_API_KEY, using local fallback generator");
                const { generateDivineAiGuidance } = await server.ssrLoadModule("/src/lib/divineAiGuidance.ts");
                const fallbackGuidance = generateDivineAiGuidance(profile);
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ status: "fallback", guidance: fallbackGuidance }));
                return;
              }

              console.log("[vite-dev] Calling Anthropic for Divine AI Guidance...");
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
                  system: SYSTEM_PROMPT,
                  messages: [{ role: "user", content: JSON.stringify(profile) }],
                }),
              });

              if (!anthropicRes.ok) {
                res.statusCode = 500;
                res.end(await anthropicRes.text());
                return;
              }

              const data = await anthropicRes.json();
              const contentText = data.content?.[0]?.text || "";
              const jsonStr = contentText.includes("{")
                ? contentText.substring(contentText.indexOf("{"), contentText.lastIndexOf("}") + 1)
                : contentText;

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
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  build: {
    emptyOutDir: true,
    reportCompressedSize: false,
  },
}));
