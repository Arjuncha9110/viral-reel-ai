import { jsonResponse } from "../../_lib/prokerala";
import { sendEmail, reportConfirmationHtml } from "../email/send";

interface Env {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as any;
    const {
      paymentId, orderId, plan,
      email, name, dob, tob, gender,
      city, lat, lon, timezone,
    } = body;

    if (!paymentId) {
      return jsonResponse(
        { status: "error", message: "Missing Razorpay payment ID." },
        { status: 400 }
      );
    }

    const keyId     = env.RAZORPAY_KEY_ID || "rzp_test_mock_id";
    const keySecret = env.RAZORPAY_KEY_SECRET;

    // ── Dev / no-credentials bypass ──────────────────────────────────────────
    if (!keySecret) {
      const mockToken = `dev_verified_${paymentId}_${Date.now()}`;
      return jsonResponse({
        status: "success",
        message: "Development Mode: Mock payment verified.",
        token: mockToken,
      });
    }

    // ── Verify with Razorpay ─────────────────────────────────────────────────
    const auth = btoa(`${keyId}:${keySecret}`);
    const res  = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      return jsonResponse(
        { status: "error", message: "Failed to communicate with payment gateway." },
        { status: 502 }
      );
    }

    const payData = (await res.json()) as any;

    if (payData.status === "captured" || payData.status === "authorized") {
      const token = `pay_verified_${paymentId}_${payData.amount}`;

      // ── Send confirmation email ────────────────────────────────────────────
      if (email) {
        const isKundali   = plan !== "sade-sati";
        const reportType  = isKundali ? "kundali" : "sade-sati";

        const params = new URLSearchParams({
          name: name || "",
          dob:  dob  || "",
          tob:  tob  || "",
          email: email,
          gender: gender || "male",
          city:  city || "",
          lat:   String(lat  || ""),
          lon:   String(lon  || ""),
          tz:    timezone || "",
          plan:  plan || "basic",
          token,
        });

        const previewPath = isKundali
          ? `/kundali-report-preview?${params.toString()}`
          : `/sade-sati-report-preview?${params.toString()}`;

        const previewUrl = `https://divinepanchang.space${previewPath}`;

        await sendEmail(
          {
            to:       email,
            toName:   name || email,
            subject:  isKundali
              ? "Your Janam Kundali Report is Ready — Divine Panchang"
              : "Your Shani Sade Sati Report is Ready — Divine Panchang",
            htmlBody: reportConfirmationHtml({ name: name || "", reportType, previewUrl }),
          },
          env
        );
      }

      return jsonResponse({
        status: "success",
        message: "Payment verified successfully.",
        token,
      });
    }

    return jsonResponse(
      { status: "error", message: `Invalid payment status: ${payData.status}` },
      { status: 400 }
    );
  } catch (error: any) {
    return jsonResponse(
      { status: "error", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
};
