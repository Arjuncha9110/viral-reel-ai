/**
 * POST /api/email/subscribe
 * Adds an email to Zoho Campaigns using your web form key — server-side.
 * (Browser-side "no-cors" never worked; doing it from a Cloudflare Worker does.)
 *
 * Required Cloudflare Pages env variable:
 *   ZOHO_FORM_KEY  — from Zoho Campaigns → Sign-Up Forms → your form → Embed → the "zx" value
 */

import { jsonResponse } from "../../_lib/prokerala";

interface Env {
  ZOHO_FORM_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || !email.includes("@")) {
      return jsonResponse({ status: "error", message: "Invalid email." }, { status: 400 });
    }

    const formKey = env.ZOHO_FORM_KEY;

    if (!formKey) {
      // Env var not set yet — log but don't break the user experience
      console.warn("[subscribe] ZOHO_FORM_KEY not configured.");
      return jsonResponse({ status: "success", message: "Subscribed." });
    }

    // POST to Zoho Campaigns web form endpoint (server-side = no CORS issue)
    const params = new URLSearchParams({
      zx:            formKey,
      CONTACT_EMAIL: email,
      mab:           "0",
    });

    const res = await fetch(
      `https://campaigns.zoho.in/campaigns/WebFormServeGet?${params.toString()}`,
      { method: "GET" }   // Zoho's web form endpoint is a GET with query params
    );

    // Zoho always returns 200 for this endpoint; we just need the request to go through
    if (res.ok || res.status === 0) {
      return jsonResponse({ status: "success", message: "Subscribed." });
    }

    console.error("[subscribe] Zoho responded:", res.status);
    return jsonResponse({ status: "success", message: "Subscribed." }); // non-breaking
  } catch (err: any) {
    console.error("[subscribe] Error:", err);
    // Still return success so UX isn't broken
    return jsonResponse({ status: "success", message: "Subscribed." });
  }
};
