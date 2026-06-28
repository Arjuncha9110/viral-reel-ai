/**
 * Transactional email sender — uses Resend API.
 *
 * Required Cloudflare Pages env variable:
 *   RESEND_API_KEY  — from resend.com → API Keys → Create API Key
 *
 * Optional:
 *   RESEND_FROM_EMAIL — e.g. noreply@divinepanchang.space  (default: onboarding@resend.dev for testing)
 *   RESEND_FROM_NAME  — e.g. Divine Panchang
 *
 * Free tier: 3,000 emails/month · 100/day
 */

import { jsonResponse } from "../../_lib/prokerala";

interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
}

export interface SendEmailPayload {
  to: string;
  toName?: string;
  subject: string;
  htmlBody: string;
}

export async function sendEmail(payload: SendEmailPayload, env: Env): Promise<boolean> {
  const apiKey   = env.RESEND_API_KEY;
  const fromName = env.RESEND_FROM_NAME  || "Divine Panchang";
  const fromAddr = env.RESEND_FROM_EMAIL || "noreply@divinepanchang.space";
  const from     = `${fromName} <${fromAddr}>`;

  if (!apiKey) {
    console.warn("[sendEmail] RESEND_API_KEY not set — skipping email.");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to:      [payload.to],
        subject: payload.subject,
        html:    payload.htmlBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[sendEmail] Resend error:", res.status, err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[sendEmail] Fetch failed:", err);
    return false;
  }
}

// ── Branded email template ────────────────────────────────────────────────────

export function reportConfirmationHtml(opts: {
  name: string;
  reportType: "kundali" | "sade-sati";
  previewUrl: string;
}): string {
  const isKundali = opts.reportType === "kundali";
  const title     = isKundali ? "Your Janam Kundali Report is Ready" : "Your Shani Sade Sati Report is Ready";
  const emoji     = isKundali ? "⊕" : "♄";
  const color     = "#b59449";

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#0b1730;border-radius:20px;overflow:hidden;border:1px solid rgba(216,188,122,0.2);">

        <tr>
          <td style="background:linear-gradient(135deg,#0b1730 0%,#1a2d4a 100%);padding:40px 32px 32px;text-align:center;border-bottom:1px solid rgba(216,188,122,0.15);">
            <div style="font-size:52px;margin-bottom:14px;color:${color};">${emoji}</div>
            <h1 style="margin:0 0 6px;color:#fdfbf7;font-size:20px;font-weight:bold;">${title}</h1>
            <p style="margin:0;color:rgba(216,188,122,0.7);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">Divine Panchang · Vedic Astrology</p>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 32px 24px;">
            <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;margin:0 0 14px;">
              Namaste${opts.name ? " " + opts.name : ""},
            </p>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;margin:0 0 28px;">
              Your payment was successful and your personalised report is ready.
              Click the button below to view and download your PDF.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${opts.previewUrl}"
                     style="display:inline-block;background:linear-gradient(135deg,${color},#8a6f35);color:#fff;text-decoration:none;font-size:15px;font-weight:bold;padding:14px 36px;border-radius:12px;border:1px solid rgba(216,188,122,0.25);">
                    View &amp; Download Report →
                  </a>
                </td>
              </tr>
            </table>
            <p style="color:rgba(255,255,255,0.25);font-size:11px;line-height:1.6;margin:0;text-align:center;">
              Button not working? Copy this link:<br>
              <a href="${opts.previewUrl}" style="color:${color};word-break:break-all;">${opts.previewUrl}</a>
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
</html>`;
}

// HTTP endpoint (internal)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const payload = (await request.json()) as SendEmailPayload;
    const ok = await sendEmail(payload, env);
    return jsonResponse({ status: ok ? "success" : "error" });
  } catch (err: any) {
    return jsonResponse({ status: "error", message: err.message }, { status: 500 });
  }
};
