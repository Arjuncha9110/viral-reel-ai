import { jsonResponse } from "../../_lib/prokerala";

interface Env {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

type CheckoutRequest = {
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

const getStripeAmountUsdCents = (plan: CheckoutRequest["plan"]) => {
  if (plan === "detailed") return "1499";
  return "499";
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as CheckoutRequest;
    const { plan = "sade-sati", email, name, dob, tob, gender, city, lat, lon, timezone } = body;

    const isSadeSati = plan === "sade-sati";
    const successPath = isSadeSati ? "sade-sati-report-preview" : "kundali-report-preview";
    const origin = new URL(request.url).origin;
    const stripeKey = env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      const sessionId = `cs_dev_${Date.now()}`;
      const params = new URLSearchParams({
        name: name || "",
        dob: dob || "",
        tob: tob || "",
        email: email || "",
        gender: gender || "male",
        city: city || "",
        lat: String(lat || ""),
        lon: String(lon || ""),
        tz: timezone || "",
        session_id: sessionId,
      });

      return jsonResponse({
        status: "success",
        mode: "dev",
        sessionId,
        url: `/${successPath}?${params.toString()}`,
      });
    }

    const successParams = new URLSearchParams({
      name: name || "",
      dob: dob || "",
      tob: tob || "",
      email: email || "",
      gender: gender || "male",
      city: city || "",
      lat: String(lat || ""),
      lon: String(lon || ""),
      tz: timezone || "",
      session_id: "{CHECKOUT_SESSION_ID}",
    });

    const successUrl = `${origin}/${successPath}?${successParams.toString()}`;
    const cancelUrl = `${origin}/${isSadeSati ? "sade-sati" : "kundali-report"}?payment=cancelled`;

    const stripeBody = new URLSearchParams({
      "payment_method_types[]": "card",
      mode: "payment",
      customer_email: email || "",
      success_url: successUrl,
      cancel_url: cancelUrl,
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": isSadeSati
        ? "Shani Sade Sati Premium Report"
        : "Janam Kundali Premium Report",
      "line_items[0][price_data][product_data][description]": isSadeSati
        ? "Personalized Saturn transit analysis with remedies and action plan"
        : "Complete Vedic birth chart with planetary analysis, Dasha periods, and house analysis",
      "line_items[0][price_data][unit_amount]": getStripeAmountUsdCents(plan),
      "line_items[0][quantity]": "1",
      "metadata[plan]": plan,
      "metadata[name]": name || "",
      "metadata[dob]": dob || "",
      "metadata[email]": email || "",
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: stripeBody.toString(),
    });

    if (!stripeRes.ok) {
      const err = (await stripeRes.json().catch(() => null)) as { error?: { message?: string } } | null;
      return jsonResponse(
        { status: "error", message: err?.error?.message || "Stripe error" },
        { status: 500 },
      );
    }

    const session = (await stripeRes.json()) as { id?: string; url?: string };

    return jsonResponse({
      status: "success",
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return jsonResponse(
      { status: "error", message: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
};
