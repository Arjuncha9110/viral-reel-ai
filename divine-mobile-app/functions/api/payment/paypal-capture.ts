import { jsonResponse } from "../../_lib/prokerala";
import { getPaymentTokenSecret, isLocalRequest, signToken } from "../../_lib/crypto";
import { sendEmail, reportConfirmationHtml } from "../email/send";

interface Env {
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_SANDBOX?: string;
  PAYMENT_TOKEN_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
}

type PayPalRequest = {
  orderID?: string;
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

const expectedUsd = (plan: PayPalRequest["plan"]) => {
  if (plan === "detailed") return 14.99;
  return 4.99;
};

const getBaseUrl = (sandbox: boolean) =>
  sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

async function getPayPalAccessToken(clientId: string, clientSecret: string, sandbox: boolean): Promise<string> {
  const response = await fetch(`${getBaseUrl(sandbox)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("PayPal authentication failed.");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("PayPal access token missing.");
  }
  return data.access_token;
}

async function getPayPalOrderDetails(orderID: string, accessToken: string, sandbox: boolean) {
  const response = await fetch(`${getBaseUrl(sandbox)}/v2/checkout/orders/${orderID}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("PayPal order lookup failed.");
  }

  return response.json() as Promise<{
    status?: string;
    purchase_units?: Array<{
      payments?: { captures?: Array<{ id?: string; amount?: { value?: string; currency_code?: string } }> };
    }>;
  }>;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as PayPalRequest;
    const { orderID, plan = "basic", email, name, dob, tob, gender, city, lat, lon, timezone } = body;

    if (!orderID) {
      return jsonResponse({ status: "error", message: "Missing PayPal order ID." }, { status: 400 });
    }

    const tokenSecret = getPaymentTokenSecret(request, env.PAYMENT_TOKEN_SECRET);
    if (!tokenSecret.ok) {
      return jsonResponse({ status: "error", message: tokenSecret.message }, { status: 500 });
    }

    const clientId = env.PAYPAL_CLIENT_ID;
    const clientSecret = env.PAYPAL_CLIENT_SECRET;
    const reportType = plan === "sade-sati" ? "sade-sati" : "kundali";

    if (!clientId || !clientSecret) {
      if (!isLocalRequest(request)) {
        return jsonResponse({ status: "error", message: "PayPal is not configured." }, { status: 500 });
      }

      const token = await signToken(
        { orderID, reportType, plan, email, name, provider: "paypal-dev" },
        tokenSecret.secret,
      );
      return jsonResponse({ status: "success", message: "Local mock PayPal payment verified.", token });
    }

    const sandbox = env.PAYPAL_SANDBOX === "true";
    const accessToken = await getPayPalAccessToken(clientId, clientSecret, sandbox);
    const orderData = await getPayPalOrderDetails(orderID, accessToken, sandbox);

    if (orderData.status !== "COMPLETED") {
      return jsonResponse({ status: "error", message: "Payment is not complete." }, { status: 400 });
    }

    const capture = orderData.purchase_units?.[0]?.payments?.captures?.[0];
    const captureAmount = Number(capture?.amount?.value || "0");

    if (capture?.amount?.currency_code !== "USD") {
      return jsonResponse({ status: "error", message: "Invalid PayPal currency." }, { status: 400 });
    }

    if (!Number.isFinite(captureAmount) || captureAmount < expectedUsd(plan) - 0.01) {
      return jsonResponse({ status: "error", message: "PayPal amount mismatch." }, { status: 400 });
    }

    const token = await signToken(
      { paymentId: capture?.id || orderID, orderID, reportType, plan, email, name, provider: "paypal" },
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

    return jsonResponse({ status: "success", message: "PayPal payment verified successfully.", token });
  } catch {
    return jsonResponse({ status: "error", message: "Internal PayPal verification error." }, { status: 500 });
  }
};
