/**
 * WhatsApp Business API Webhook
 * GET  /api/whatsapp/webhook  - Meta webhook verification
 * POST /api/whatsapp/webhook  - Incoming messages -> Claude AI -> WhatsApp reply
 *
 * Required Cloudflare Pages env vars:
 *   WHATSAPP_TOKEN            - Meta permanent access token
 *   WHATSAPP_PHONE_NUMBER_ID  - Meta phone number ID
 *   WHATSAPP_VERIFY_TOKEN     - webhook verification token
 *   ANTHROPIC_API_KEY         - Claude API key
 *
 * Optional env vars:
 *   ANTHROPIC_MODEL           - defaults to claude-3-5-haiku-20241022
 */

interface Env {
  WHATSAPP_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_VERIFY_TOKEN?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL?: string;
  SHEETS_WEBHOOK_URL?: string;
}

type PagesContext<TEnv> = {
  request: Request;
  env: TEnv;
};

type PagesFunction<TEnv> = (context: PagesContext<TEnv>) => Response | Promise<Response>;

type AnthropicBlock = {
  type?: string;
  text?: string;
};

const DEFAULT_VERIFY_TOKEN = "divinewhatsapp2026";
const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are a helpful assistant for Divine Panchang (divinepanchang.space), a Vedic astrology and daily panchang website.

You help users with:
- Daily panchang (tithi, nakshatra, yoga, karana, muhurta)
- Janam Kundli (birth chart) explanations
- Sade Sati (Saturn transit) questions
- Numerology queries
- Festival dates and significance
- Vedic astrology basics
- Report purchases and support

Keep replies short and conversational (2-4 sentences max) because this is WhatsApp.
Use simple language.
If asked about pricing, reports are available at divinepanchang.space.
For complex questions, invite them to visit the website.
For support or payment issues, direct users to info@divinepanchang.space.
Always be warm and respectful.
Always reply in English only, regardless of the language the user writes in.`;

const FALLBACK_REPLY =
  "Namaste. I am here to help with Divine Panchang. Please share your question, or visit divinepanchang.space if you need a full report.";

async function sendWhatsAppMessage(
  token: string,
  phoneNumberId: string,
  to: string,
  text: string
): Promise<void> {
  const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[whatsapp] Meta send error:", response.status, body);
    throw new Error(`Meta send failed with status ${response.status}`);
  }
}

async function getClaudeReply(env: Env, userMessage: string): Promise<string> {
  const apiKey = env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("[whatsapp] Missing ANTHROPIC_API_KEY, using fallback reply");
    return FALLBACK_REPLY;
  }

  const model = env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[whatsapp] Claude error:", response.status, body);
    return FALLBACK_REPLY;
  }

  const data = (await response.json()) as { content?: AnthropicBlock[] };
  const reply = data.content
    ?.filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text?.trim() || "")
    .filter(Boolean)
    .join("\n")
    .trim();

  return reply || FALLBACK_REPLY;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verifyToken = env.WHATSAPP_VERIFY_TOKEN || DEFAULT_VERIFY_TOKEN;

  if (!mode && !token && !challenge) {
    // ?debug=1 — test Claude + WhatsApp send end-to-end without waiting for Meta
    const debug = url.searchParams.get("debug");
    if (debug === "1") {
      // Full end-to-end test: Claude reply → WhatsApp send to ?to= param (default: 917411315321)
      const testTo = url.searchParams.get("to") || "917411315321";
      const claudeReply = await getClaudeReply(env, "Hello! What is today's tithi?");
      const waToken = env.WHATSAPP_TOKEN;
      const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
      let waSendStatus = 0;
      let waSendBody = "";
      if (waToken && phoneNumberId) {
        const waRes = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${waToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ messaging_product: "whatsapp", to: testTo, type: "text", text: { body: "[DEBUG] " + claudeReply } }),
        });
        waSendStatus = waRes.status;
        waSendBody = await waRes.text();
      }
      return new Response(JSON.stringify({ claudeReply, waSendStatus, waSendBody, sentTo: testTo }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        route: "/api/whatsapp/webhook",
        verifyTokenConfigured: Boolean(env.WHATSAPP_VERIFY_TOKEN),
        whatsappTokenConfigured: Boolean(env.WHATSAPP_TOKEN),
        phoneNumberIdConfigured: Boolean(env.WHATSAPP_PHONE_NUMBER_ID),
        anthropicConfigured: Boolean(env.ANTHROPIC_API_KEY),
        anthropicModel: env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as any;
    console.log("[whatsapp] Incoming payload:", JSON.stringify(body));
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== "text") {
      console.log("[whatsapp] Ignored payload without text message");
      return new Response("OK", { status: 200 });
    }

    const from = String(message.from || "").trim();
    const userText = String(message.text?.body || "").trim();

    if (!from || !userText) {
      return new Response("OK", { status: 200 });
    }

    const waToken = env.WHATSAPP_TOKEN;
    const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;

    if (!waToken || !phoneNumberId) {
      console.warn("[whatsapp] Missing WhatsApp env vars");
      return new Response("OK", { status: 200 });
    }

    const reply = await getClaudeReply(env, userText);
    await sendWhatsAppMessage(waToken, phoneNumberId, from, reply);

    // Log to Google Sheets
    if (env.SHEETS_WEBHOOK_URL) {
      try {
        await fetch(env.SHEETS_WEBHOOK_URL, {
          method: "POST",
          redirect: "follow",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            phone: from,
            message: userText,
            reply,
          }),
        });
      } catch (_) {}
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[whatsapp] Error:", error);
    return new Response("OK", { status: 200 });
  }
};
