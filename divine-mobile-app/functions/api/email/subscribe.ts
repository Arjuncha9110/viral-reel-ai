/**
 * POST /api/email/subscribe
 * Newsletter signup — sends a welcome email to the subscriber and a
 * notification to the site owner via Resend.
 *
 * Required Cloudflare Pages env variable:
 *   RESEND_API_KEY  — from resend.com → API Keys
 *
 * Optional:
 *   RESEND_FROM_EMAIL  — sender address (default: noreply@divinepanchang.space)
 *   NOTIFY_EMAIL       — owner inbox to receive subscriber notifications
 *                        (default: info@divinepanchang.space)
 */

import { jsonResponse } from "../../_lib/prokerala";

interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  NOTIFY_EMAIL?: string;
  RESEND_AUDIENCE_ID?: string;
}

async function sendViaResend(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      console.error("[subscribe] Resend error:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[subscribe] Resend fetch failed:", err);
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { email } = (await request.json()) as { email?: string };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      return jsonResponse({ status: "error", message: "Invalid email." }, { status: 400 });
    }

    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[subscribe] RESEND_API_KEY not set.");
      return jsonResponse(
        { status: "error", message: "Newsletter signup is not configured yet." },
        { status: 503 }
      );
    }

    const cleanEmail = email.trim();
    const fromAddr = env.RESEND_FROM_EMAIL || "noreply@divinepanchang.space";
    const notifyAddr = env.NOTIFY_EMAIL || "info@divinepanchang.space";
    const fromFull = `Divine Panchang <${fromAddr}>`;
    const audienceId = env.RESEND_AUDIENCE_ID || "59ecfac0-79c4-49cc-a29f-15e727772402";

    // 1. Notify site owner
    await sendViaResend(
      apiKey,
      fromFull,
      notifyAddr,
      `New newsletter subscriber: ${cleanEmail}`,
      `<p>New subscriber signed up for the 2026 Vedic Forecast newsletter:</p>
       <p><strong>${cleanEmail}</strong></p>
       <p><small>Received via divinepanchang.space footer form</small></p>`
    );

    // 2. Welcome email to subscriber
    await sendViaResend(
      apiKey,
      fromFull,
      cleanEmail,
      "Your Free 2026 Vedic Forecast — Divine Panchang 🙏",
      `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#0b1730;border-radius:20px;overflow:hidden;border:1px solid rgba(216,188,122,0.2);">
        <tr>
          <td style="background:linear-gradient(135deg,#0b1730 0%,#1a2d4a 100%);padding:40px 32px 32px;text-align:center;border-bottom:1px solid rgba(216,188,122,0.15);">
            <div style="font-size:48px;margin-bottom:12px;">🕉️</div>
            <h1 style="margin:0 0 6px;color:#fdfbf7;font-size:22px;font-weight:bold;">Namaste! You're subscribed.</h1>
            <p style="margin:0;color:rgba(216,188,122,0.7);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">Divine Panchang · Vedic Astrology</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 24px;">
            <p style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.7;margin:0 0 16px;">
              Thank you for subscribing to the Divine Panchang newsletter!
            </p>
            <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7;margin:0 0 24px;">
              We'll send you your personalized <strong style="color:#d8bc7a;">2026 Vedic Forecast</strong> shortly — with auspicious months, planetary transits, lucky periods, and guidance for the year ahead.
            </p>
            <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7;margin:0;">
              In the meantime, explore today's panchang and more at
              <a href="https://www.divinepanchang.space" style="color:#d8bc7a;">divinepanchang.space</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:rgba(0,0,0,0.2);padding:18px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;line-height:1.6;">
              © Divine Panchang · divinepanchang.space<br>
              Questions? Write to info@divinepanchang.space
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
    );

    // 3. Add contact to Resend audience (after emails sent — non-blocking)
    fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email: cleanEmail, unsubscribed: false }),
    }).catch((err) => console.warn("[subscribe] Could not add contact to audience:", err));

    return jsonResponse({
      status: "success",
      message: "You're subscribed! Check your inbox for your free 2026 Vedic Forecast.",
      subscribed: true,
    });
  } catch (err: any) {
    console.error("[subscribe] Error:", err);
    return jsonResponse(
      { status: "error", message: err?.message || "Could not complete signup." },
      { status: 500 }
    );
  }
};
