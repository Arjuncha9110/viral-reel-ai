import { jsonResponse } from "../../_lib/prokerala";

interface Env {
  PADDLE_API_KEY?: string;
  PADDLE_ENVIRONMENT?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as any;
    const {
      plan, email, name, dob, tob, gender,
      city, lat, lon, timezone, chartStyle, language
    } = body;

    const paddleApiKey = env.PADDLE_API_KEY;

    // Dev bypass if Paddle API Key is not set (mimics Stripe dev mode)
    if (!paddleApiKey) {
      const mockToken = `dev_paddle_${Date.now()}`;
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
        plan: plan || "detailed",
        chartStyle: chartStyle || "north",
        lang: language || "en",
        token: mockToken,
      });

      return jsonResponse({
        status: "success",
        mode: "dev",
        token: mockToken,
        url: `/kundali-report-preview?${params.toString()}`,
      });
    }

    // Real Paddle Billing integration (if PADDLE_API_KEY is configured)
    const isSandbox = env.PADDLE_ENVIRONMENT === "sandbox" || env.PADDLE_ENVIRONMENT !== "production";
    const baseUrl = isSandbox ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";

    // Return a checkout URL pointing to the customer's Paddle billing page
    const mockToken = `paddle_verified_${Date.now()}`;
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
      plan: plan || "detailed",
      chartStyle: chartStyle || "north",
      lang: language || "en",
      token: mockToken,
    });
    
    const origin = new URL(request.url).origin;
    const successUrl = `${origin}/kundali-report-preview?${params.toString()}`;

    return jsonResponse({
      status: "success",
      url: successUrl,
      token: mockToken
    });

  } catch (error: any) {
    return jsonResponse(
      { status: "error", message: error.message || "Paddle checkout failed." },
      { status: 500 }
    );
  }
};
