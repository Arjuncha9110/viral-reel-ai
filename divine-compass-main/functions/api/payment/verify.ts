import { jsonResponse } from "../../_lib/prokerala";
import { sendEmail, reportConfirmationHtml } from "../email/send";
import {
  getPaymentTokenSecret,
  isLocalRequest,
  signToken,
  verifyRazorpaySignature,
} from "../../_lib/crypto";

interface Env {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  PAYMENT_TOKEN_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
}

type VerifyRequest = {
  paymentId?: string;
  orderId?: string;
  signature?: string;
  plan?: "basic" | "detailed" | "sade-sati";
  email?: string;
  name?: string;
  dob?: string;
  tob?: string;
  gender?: string;
  city?: string;
  lat?: string | number;
  lon?: string | number;
  timezone?: string;
};

const expectedAmountPaise = (plan: VerifyRequest["plan"]) => {
  if (plan === "detailed") return 99900;
  if (plan === "sade-sati") return 39900;
  return 29900;
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as VerifyRequest;
    const {
      paymentId,
      orderId,
      signature,
      plan = "basic",
      email,
      name,
      dob,
      tob,
      gender,
      city,
      lat,
      lon,
      timezone,
    } = body;

    if (!paymentId) {
      return jsonResponse({ status: "error", message: "Missing Razorpay payment ID." }, { status: 400 });
    }

    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;
    const tokenSecret = getPaymentTokenSecret(request, env.PAYMENT_TOKEN_SECRET);
    const local = isLocalRequest(request);

    if (!tokenSecret.ok) {
      return jsonResponse({ status: "error", message: tokenSecret.message }, { status: 500 });
    }

    const reportType = plan === "sade-sati" ? "sade-sati" : "kundali";

    if (!keyId || !keySecret) {
      if (!local) {
        return jsonResponse({ status: "error", message: "Razorpay is not configured." }, { status: 500 });
      }

      const token = await signToken(
        { paymentId, reportType, plan, email, name, provider: "razorpay-dev" },
        tokenSecret.secret,
      );
      return jsonResponse({ status: "success", message: "Local mock payment verified.", token });
    }

    if (!orderId || !signature) {
      return jsonResponse({ status: "error", message: "Missing Razorpay order signature." }, { status: 400 });
    }

    const validSignature = await verifyRazorpaySignature(orderId, paymentId, signature, keySecret);
    if (!validSignature) {
      return jsonResponse({ status: "error", message: "Invalid payment signature." }, { status: 400 });
    }

    const auth = btoa(`${keyId}:${keySecret}`);
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      return jsonResponse({ status: "error", message: "Payment gateway verification failed." }, { status: 502 });
    }

    const payment = (await response.json()) as {
      status?: string;
      amount?: number;
      currency?: string;
      order_id?: string;
    };

    if (payment.status !== "captured" && payment.status !== "authorized") {
      return jsonResponse({ status: "error", message: "Payment is not captured." }, { status: 400 });
    }

    if (payment.order_id && payment.order_id !== orderId) {
      return jsonResponse({ status: "error", message: "Payment order mismatch." }, { status: 400 });
    }

    if (payment.currency !== "INR") {
      return jsonResponse({ status: "error", message: "Invalid payment currency." }, { status: 400 });
    }

    if (typeof payment.amount !== "number" || payment.amount < expectedAmountPaise(plan)) {
      return jsonResponse({ status: "error", message: "Payment amount mismatch." }, { status: 400 });
    }

    const token = await signToken(
      { paymentId, orderId, reportType, plan, email, name, provider: "razorpay" },
      tokenSecret.secret,
    );

    if (email) {
      const params = new URLSearchParams({
        name: name || "",
        dob: dob || "",
        tob: tob || "",
        email,
        gender: gender || "male",
        city: city || "",
        lat: String(lat || ""),
        lon: String(lon || ""),
        tz: timezone || "",
        plan,
        token,
      });

      const previewPath =
        reportType === "kundali"
          ? `/kundali-report-preview?${params.toString()}`
          : `/sade-sati-report-preview?${params.toString()}`;

      await sendEmail(
        {
          to: email,
          toName: name || email,
          subject:
            reportType === "kundali"
              ? "Your Janam Kundali Report is Ready - Divine Panchang"
              : "Your Shani Sade Sati Report is Ready - Divine Panchang",
          htmlBody: reportConfirmationHtml({
            name: name || "",
            reportType,
            previewUrl: `https://divinepanchang.space${previewPath}`,
          }),
        },
        env,
      );
    }

    return jsonResponse({ status: "success", message: "Payment verified successfully.", token });
  } catch {
    return jsonResponse({ status: "error", message: "Internal server error during verification." }, { status: 500 });
  }
};
