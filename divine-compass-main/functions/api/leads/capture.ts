interface Env {
  SHEETS_WEBHOOK_URL?: string;
  LEADS_SHEETS_WEBHOOK_URL?: string;
}

type PagesContext<TEnv> = {
  request: Request;
  env: TEnv;
};

type PagesFunction<TEnv> = (context: PagesContext<TEnv>) => Response | Promise<Response>;

type LeadPayload = {
  source?: string;
  type?: string;
  page?: string;
  timestamp?: string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
};

const json = (payload: object, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const isLocalRequest = (request: Request) => {
  const hostname = new URL(request.url).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
};

const normalizeLead = (payload: LeadPayload, request: Request): LeadPayload => {
  const url = new URL(request.url);
  return {
    ...payload,
    source: payload.source || payload.type || "website",
    page: payload.page || request.headers.get("referer") || "",
    timestamp: payload.timestamp || new Date().toISOString(),
    utm_source: payload.utm_source || url.searchParams.get("utm_source") || "",
    utm_medium: payload.utm_medium || url.searchParams.get("utm_medium") || "",
    utm_campaign: payload.utm_campaign || url.searchParams.get("utm_campaign") || "",
    dedupeKey: [
      payload.email || "",
      payload.phone || "",
      payload.source || payload.type || "website",
      new Date().toISOString().slice(0, 10),
    ].join("|"),
  };
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as LeadPayload;
    const source = body.source || body.type;

    if (!source) {
      return json({ ok: false, status: "error", message: "Lead source is required." }, 400);
    }

    if (!body.name && !body.email && !body.phone) {
      return json({ ok: false, status: "error", message: "At least one contact field is required." }, 400);
    }

    const webhookUrl = env.LEADS_SHEETS_WEBHOOK_URL || env.SHEETS_WEBHOOK_URL;
    const lead = normalizeLead(body, request);

    if (!webhookUrl) {
      console.warn("[leads] Missing leads webhook URL", JSON.stringify(lead));
      return json(
        {
          ok: isLocalRequest(request),
          status: isLocalRequest(request) ? "local_ignored" : "error",
          message: "Lead webhook is not configured.",
        },
        isLocalRequest(request) ? 200 : 500,
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      console.error("[leads] Google Sheets webhook failed:", response.status, await response.text().catch(() => ""));
      return json({ ok: false, status: "error", message: "Lead save failed." }, 502);
    }

    return json({ ok: true, status: "saved" });
  } catch (error) {
    console.error("[leads] Error processing request:", error);
    return json({ ok: false, status: "error", message: "Internal error." }, 500);
  }
};
