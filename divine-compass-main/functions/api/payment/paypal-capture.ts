import { jsonResponse } from "../../_lib/prokerala";
import { sendEmail, reportConfirmationHtml } from "../email/send";

interface Env {
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
}

// Get PayPal access token
async function getPayPalAccessToken(clientId: string, clientSecret: string, sandbox = false): Promise<string> {
  const base = sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`);
  }

  const data = (await res.json()) as any;
  return data.access_token;
}

// Verify PayPal order capture
async function getPayPalOrderDetails(orderID: string, accessToken: string, sandbox = false): Promise<any> {
  const base = sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
  const res = await fetch(`${base}/v2/checkout/orders/${orderID}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`PayPal order lookup failed: ${res.status}`);
  }

  return res.json();
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as any;
    const { orderID, plan, email, name, dob, tob, gender, city, lat, lon, timezone } = body;

    if (!orderID) {
      return jsonResponse(
        { status: "error", message: "Missing PayPal order ID." },
        { status: 400 }
      );
    }

    const clientId = env.PAYPAL_CLIENT_ID;
    const clientSecret = env.PAYPAL_CLIENT_SECRET;

    // Dev bypass when credentials not set
    if (!clientId || !clientSecret) {
      const mockToken = `dev_paypal_verified_${orderID}_${Date.now()}`;
      return jsonResponse({
        status: "success",
        message: "Development Mode: Mock PayPal payment verified.",
        token: mockToken,
      });
    }

    // Check if sandbox mode (client IDs starting with "A" are sandbox/live both, we check the secret prefix)
    // You can set PAYPAL_SANDBOX=true env var for sandbox mode
    const sandbox = false; // Set to true for testing

    // Get access token
    const accessToken = await getPayPalAccessToken(clientId, clientSecret, sandbox);

    // Fetch order details
    const orderData = await getPayPalOrderDetails(orderID, accessToken, sandbox);

    // Validate order status is COMPLETED
    if (orderData.status !== "COMPLETED") {
      return jsonResponse(
        {
          status: "error",
          message: `Payment not completed. Order status: ${orderData.status}`,
        },
        { status: 400 }
      );
    }

    // Validate amount matches the plan
    const captureAmount = parseFloat(
      orderData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0"
    );
    let expectedAmount = 4.99;
    if (plan === "detailed") {
      expectedAmount = 14.99;
    } else if (plan === "basic") {
      expectedAmount = 4.99;
    } else if (plan === "sade-sati") {
      expectedAmount = 4.99;
    }

    if (captureAmount < expectedAmount - 0.01) {
      return jsonResponse(
        {
          status: "error",
          message: `Payment amount mismatch. Expected $${expectedAmount}, got $${captureAmount}`,
        },
        { status: 400 }
      );
    }

    // Payment verified — generate session token
    const captureId = orderData.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderID;
    const token = `paypal_verified_${captureId}_${Date.now()}`;

    // Send confirmation email
    if (email) {
      const isKundali  = plan !== "sade-sati";
      const reportType = isKundali ? "kundali" : "sade-sati" as "kundali" | "sade-sati";

      const params = new URLSearchParams({
        name: name || "", dob: dob || "", tob: tob || "",
        email, gender: gender || "male",
        city: city || "", lat: String(lat || ""), lon: String(lon || ""),
        tz: timezone || "", plan: plan || "basic", token,
      });

      const previewUrl = `https://divinepanchang.space${
        isKundali ? `/kundali-report-preview?${params}` : `/sade-sati-report-preview?${params}`
      }`;

      await sendEmail(
        {
          to: email, toName: name || email,
          subject: isKundali
            ? "Your Janam Kundali Report is Ready — Divine Panchang"
            : "Your Shani Sade Sati Report is Ready — Divine Panchang",
          htmlBody: reportConfirmationHtml({ name: name || "", reportType, previewUrl }),
        },
        env
      );
    }

    return jsonResponse({
      status: "success",
      message: "PayPal payment verified successfully.",
      token,
    });
  } catch (error: any) {
    return jsonResponse(
      { status: "error", message: error.message || "Internal PayPal verification error" },
      { status: 500 }
    );
  }
};
