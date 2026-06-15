import { jsonResponse } from "../../_lib/prokerala";
import { getPaymentTokenSecret, isLocalRequest, signToken, verifyToken } from "../../_lib/crypto";

interface Env {
  PAYMENT_TOKEN_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
}

type SessionPayload = {
  token?: string;
  sessionId?: string;
  reportType?: "kundali" | "sade-sati";
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { token, sessionId, reportType } = (await request.json()) as SessionPayload;
    const tokenSecret = getPaymentTokenSecret(request, env.PAYMENT_TOKEN_SECRET);

    if (!tokenSecret.ok) {
      return jsonResponse({ status: "error", message: tokenSecret.message }, { status: 500 });
    }

    if (sessionId) {
      const stripeKey = env.STRIPE_SECRET_KEY;

      if (!stripeKey) {
        if (!isLocalRequest(request)) {
          return jsonResponse({ status: "error", message: "Stripe is not configured." }, { status: 500 });
        }

        const newToken = await signToken(
          { sessionId, reportType, provider: "stripe-dev" },
          tokenSecret.secret,
        );

        return jsonResponse({
          status: "success",
          message: "Local Stripe session accepted.",
          session: { reportType, provider: "stripe-dev" },
          token: newToken,
        });
      }

      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });

      if (!response.ok) {
        return jsonResponse({ status: "error", message: "Invalid payment session." }, { status: 400 });
      }

      const sessionData = (await response.json()) as {
        payment_status?: string;
        customer_email?: string;
        customer_details?: { email?: string };
      };

      if (sessionData.payment_status !== "paid") {
        return jsonResponse({ status: "error", message: "Payment is not complete." }, { status: 400 });
      }

      const newToken = await signToken(
        {
          sessionId,
          reportType,
          provider: "stripe",
          email: sessionData.customer_email || sessionData.customer_details?.email,
        },
        tokenSecret.secret,
      );

      return jsonResponse({
        status: "success",
        message: "Session valid.",
        session: { reportType, provider: "stripe" },
        token: newToken,
      });
    }

    if (!token) {
      return jsonResponse({ status: "error", message: "Token or session ID is required." }, { status: 400 });
    }

    const decoded = await verifyToken(token, tokenSecret.secret);
    if (!decoded) {
      return jsonResponse({ status: "error", message: "Invalid or expired token." }, { status: 401 });
    }

    if (reportType && decoded.reportType && decoded.reportType !== reportType) {
      return jsonResponse({ status: "error", message: "Token does not match report type." }, { status: 403 });
    }

    return jsonResponse({ status: "success", message: "Session valid.", session: decoded });
  } catch {
    return jsonResponse({ status: "error", message: "Verification failed." }, { status: 500 });
  }
};
