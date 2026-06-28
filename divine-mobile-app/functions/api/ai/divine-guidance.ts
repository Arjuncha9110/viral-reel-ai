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

const SYSTEM_PROMPT = `You are "Divine AI Guru", a personal Vedic companion for a daily panchang and astrology website (Divine Panchang).
Your purpose is to offer spiritual reflection, daily discipline, and practical Vedic framing based on the user's details and questions.

CRITICAL RULES:
1. Calm and Practical: The tone must be calm, reflective, grounded, and non-fear-based. Do not use overly mystical jargon that confuses the user.
2. No Medical/Financial Advice: Never guarantee specific outcomes (e.g., "you will get the job", "your illness will be cured"). Frame answers around focus, energy, and timing.
3. No Fake Calculations: Do NOT invent or fabricate planetary calculations. If structured astrology data isn't provided, explicitly frame your response as reflective guidance based on their stated goal and question.
4. Output Format: You MUST return a single, valid JSON object exactly matching this structure (do not include markdown wrapping like \`\`\`json):
{
  "salutation": "String (e.g., 'Good morning, Arun.')",
  "focusTitle": "String (e.g., 'A reflective day for steady progress')",
  "summary": "String (2-3 sentences max)",
  "doToday": "String (1 actionable step)",
  "avoidToday": "String (1 thing to avoid)",
  "mantra": "String (A short, relevant Sanskrit mantra, e.g., 'Om Namah Shivaya')",
  "journalPrompt": "String (A deep, reflective question)",
  "reflection": "String (A concluding thought linking their source to their goal)",
  "followUpPrompts": ["String (Prompt 1)", "String (Prompt 2)", "String (Prompt 3)"],
  "disclaimer": "Divine AI Guru offers spiritual reflection and practical Vedic framing. It does not replace medical, legal, financial, or mental health advice."
}

Do NOT output anything other than the raw JSON object.`;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const profile = (await request.json()) as DivineAiProfile;
    
    // Check for API key
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
- Name: ${profile.name || "Friend"}
- Birth Date: ${profile.birthDate || "Not provided"}
- Birth Time: ${profile.birthTime || "Not provided"}
- Goal: ${profile.goal}
- Source Context: ${profile.source || "default"}
- Question: ${profile.question || "None"}

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
    
    // Attempt to parse JSON
    let guidance: DivineAiGuidance;
    try {
      // Find JSON if Claude included markdown by mistake
      const jsonStr = contentText.includes("{") 
        ? contentText.substring(contentText.indexOf("{"), contentText.lastIndexOf("}") + 1)
        : contentText;
      guidance = JSON.parse(jsonStr) as DivineAiGuidance;
    } catch (parseError) {
      console.error("[divine-ai] JSON parse error:", parseError, "Raw output:", contentText);
      // Fallback
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
