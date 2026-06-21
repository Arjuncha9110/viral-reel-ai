import { type DivineAiProfile, type DivineAiGuidance, generateDivineAiGuidance } from "../../../src/lib/divineAiGuidance";

interface Env {
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL?: string;
}

type PagesContext<TEnv> = {
  request: Request;
  env: TEnv;
};

type PagesFunction<TEnv> = (context: PagesContext<TEnv>) => Response | Promise<Response>;

const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-haiku-20241022";

const SYSTEM_PROMPT = `You are Divine AI Guru, a calm Vedic spiritual companion for a daily panchang and astrology website (Divine Panchang).
You provide practical, non-fear-based daily guidance using Panchang, astrology profile data, and the user’s stated goal.

CRITICAL RULES:
1. Tone: Calm, Spiritual, Practical, Warm, Simple English, No fear. No guaranteed predictions. Use language like "this may support", "you may focus on".
2. No Medical/Financial Advice: Do not replace medical, legal, financial, or mental health advice. Do not recommend extreme remedies.
3. No Fake Calculations: Do NOT invent exact planet placements, nakshatra, tithi, or dasha data. The AI should only explain structured astrology/Panchang data that already exists or is passed into it. If astrology data is unavailable, explicitly frame your response as reflective guidance based on their stated goal and question.
4. Output Format: You MUST return a single, valid JSON object exactly matching this structure (do not include markdown wrapping):
{
  "title": "String (e.g., 'Your Divine Guidance for Today')",
  "summary": "String (2-3 sentences max)",
  "doToday": "String (1 actionable step)",
  "avoidToday": "String (1 thing to avoid)",
  "mantra": {
    "title": "String",
    "text": "String (A relevant Sanskrit mantra, e.g., 'Om Namah Shivaya')",
    "meaning": "String"
  },
  "journalPrompt": "String (A deep, reflective question)",
  "spiritualAction": "String (A brief spiritual task, e.g., 'Spend 7 minutes in silent breathing.')",
  "bestTimeWindow": "String (A suggested time period or 'Choose a calm morning.')",
  "gentleReminder": "String (A comforting sign-off)",
  "upgradeHook": "String (A hook for the 30-day plan, e.g., 'Your 30-day Divine Plan can turn this into a daily routine.')"
}

Do NOT output anything other than the raw JSON object.`;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const profile = (await request.json()) as DivineAiProfile;
    
    if (!env.ANTHROPIC_API_KEY) {
      console.warn("[divine-ai] Missing ANTHROPIC_API_KEY, falling back to deterministic logic.");
      const fallbackGuidance = generateDivineAiGuidance(profile);
      return new Response(JSON.stringify({ status: "fallback", guidance: fallbackGuidance }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const promptText = `
User Profile:
- Name: ${profile.profile?.displayName || "Seeker"}
- Birth Date: ${profile.birthDetails?.date || "Unknown"}
- Birth Time: ${profile.birthDetails?.time || "Unknown"}
- Birth Place: ${profile.birthDetails?.city || profile.birthDetails?.formattedAddress || "Unknown"}
- Current Location: ${profile.currentLocation?.city || profile.currentLocation?.formattedAddress || "Unknown"}
- Goal: ${profile.goal || "General spiritual growth"}
- Source Context: ${profile.sourceContext || "General"}
- Question: ${profile.question || "What guidance do I need today?"}
- Astrology Context: ${JSON.stringify(profile.astrologyContext || {})}

Please provide guidance based on the system prompt rules and return ONLY the JSON.`;

    const model = env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: promptText }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[divine-ai] Anthropic API Error:", response.status, errorBody);
      throw new Error("Failed to fetch from Anthropic");
    }

    const data = await response.json();
    const contentText = data.content?.[0]?.text || "";
    
    let guidance: DivineAiGuidance;
    try {
      const jsonStr = contentText.includes("{") 
        ? contentText.substring(contentText.indexOf("{"), contentText.lastIndexOf("}") + 1)
        : contentText;
      guidance = JSON.parse(jsonStr) as DivineAiGuidance;
    } catch (parseError) {
      console.error("[divine-ai] JSON parse error:", parseError, "Raw output:", contentText);
      return new Response(JSON.stringify({ status: "fallback", guidance: generateDivineAiGuidance(profile) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "success", guidance }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[divine-ai] Endpoint error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
