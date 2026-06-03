import { jsonResponse } from "../../_lib/prokerala";

interface Env {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as any;
    const { plan, email, name, dob, tob, gender, city, lat, lon, timezone } = body;

    const stripeKey = env.STRIPE_SECRET_KEY;

    // Dev bypass — no Stripe key set
    if (!stripeKey) {
      const mockToken = `dev_stripe_${Date.now()}`;
      return jsonResponse({
        status: "success",
        mode: "dev",
        token: mockToken,
        url: `/sade-sati-report-preview?name=${encodeURIComponent(name || "")}&dob=${dob || ""}&tob=${tob || ""}&email=${encodeURIComponent(email || "")}&gender=${gender || "male"}&city=${encodeURIComponent(city || "")}&lat=${lat || ""}&lon=${lon || ""}&tz=${timezone || ""}&token=${mockToken}`,
      });
    }

    const isSadeSati = plan === "sade-sati";
    const successPath = isSadeSati ? "sade-sati-report-preview" : "kundali-report-preview";

    // Build success URL with all user details
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

    const origin = new URL(request.url).origin;
    const successUrl = `${origin}/${successPath}?${successParams.toString()}`;
    const cancelUrl = `${origin}/${isSadeSati ? "sade-sati" : "kundali-report"}?payment=cancelled`;

    // Create Stripe Checkout Session
    const stripeBody = new URLSearchParams({
      "payment_method_types[]": "card",
      "mode": "payment",
      "customer_email": email || "",
      "success_url": successUrl,
      "cancel_url": cancelUrl,
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": isSadeSati
        ? "Shani Sade Sati Premium Report"
        : "Janam Kundali Premium Report",
      "line_items[0][price_data][product_data][description]": isSadeSati
        ? "Personalized 14-page Saturn transit analysis with remedies, predictions & action plan"
        : "Complete Vedic birth chart with planetary analysis, Dasha periods & house analysis",
      "line_items[0][price_data][unit_amount]": "499",
      "line_items[0][quantity]": "1",
      "metadata[plan]": plan || "sade-sati",
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
      const err = (await stripeRes.json()) as any;
      return jsonResponse(
        { status: "error", message: err?.error?.message || "Stripe error" },
        { status: 500 }
      );
    }

    const session = (await stripeRes.json()) as any;

    return jsonResponse({
      status: "success",
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    return jsonResponse(
      { status: "error", message: error.message || "Internal error" },
      { status: 500 }
    );
  }
};
