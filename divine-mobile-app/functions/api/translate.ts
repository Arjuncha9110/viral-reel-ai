/**
 * POST /api/translate
 * Translates an array of English strings to the target language using Google Cloud Translation API.
 *
 * Required Cloudflare Pages env variable:
 *   GOOGLE_TRANSLATE_API_KEY  — from console.cloud.google.com → APIs → Cloud Translation API
 *
 * Body: { texts: string[], target: string }
 * Response: { translations: string[] }
 */

import { jsonResponse } from "../_lib/prokerala";

interface Env {
  GOOGLE_TRANSLATE_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { texts, target } = (await request.json()) as { texts?: string[]; target?: string };

    if (!texts || !Array.isArray(texts) || !target) {
      return jsonResponse({ status: "error", message: "Missing texts or target." }, { status: 400 });
    }

    const apiKey = env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      // No key — return originals unchanged (graceful fallback)
      return jsonResponse({ status: "success", translations: texts });
    }

    // Google Cloud Translation API v2 (Basic)
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: texts, target, format: "text" }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[translate] Google API error:", res.status, err);
      // Fallback: return originals
      return jsonResponse({ status: "success", translations: texts });
    }

    const json = (await res.json()) as {
      data: { translations: { translatedText: string }[] };
    };

    const translations = json.data.translations.map((t) => t.translatedText);
    return jsonResponse({ status: "success", translations });
  } catch (err: any) {
    console.error("[translate] Error:", err);
    return jsonResponse({ status: "error", message: err.message }, { status: 500 });
  }
};
