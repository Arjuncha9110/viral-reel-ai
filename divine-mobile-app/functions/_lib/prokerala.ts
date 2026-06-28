type TokenCache = {
  accessToken: string;
  expiresAt: number;
} | null;

let cachedToken: TokenCache = null;

export interface ProkeralaEnv {
  PROKERALA_CLIENT_ID?: string;
  PROKERALA_CLIENT_SECRET?: string;
  PROKERALA_BASE_URL?: string;
  PROKERALA_AYANAMSA?: string;
  PROKERALA_PANCHANG_PATH?: string;
  PROKERALA_DASHA_PATH?: string;
  PROKERALA_BIRTH_DETAILS_PATH?: string;
  PROKERALA_KUNDLI_PATH?: string;
  PROKERALA_SADE_SATI_PATH?: string;
}

export class ProkeralaConfigError extends Error {}
export class ProkeralaApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_BASE_URL = "https://api.prokerala.com/";

const getBaseUrl = (env: ProkeralaEnv) => env.PROKERALA_BASE_URL || DEFAULT_BASE_URL;

const requireCredentials = (env: ProkeralaEnv) => {
  if (!env.PROKERALA_CLIENT_ID || !env.PROKERALA_CLIENT_SECRET) {
    throw new ProkeralaConfigError(
      "Missing Prokerala credentials. Set PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET in Pages environment variables."
    );
  }
};

const parseErrorMessage = (payload: unknown): string => {
  if (payload && typeof payload === "object") {
    const errorPayload = payload as { message?: string; errors?: Array<{ detail?: string; title?: string }> };
    if (errorPayload.message) return errorPayload.message;
    if (Array.isArray(errorPayload.errors) && errorPayload.errors.length > 0) {
      return errorPayload.errors
        .map((entry) => entry.detail || entry.title)
        .filter(Boolean)
        .join("; ");
    }
  }

  return "Unexpected Prokerala API response.";
};

const fetchAccessToken = async (env: ProkeralaEnv): Promise<string> => {
  requireCredentials(env);

  if (cachedToken && cachedToken.expiresAt > Date.now() + 10_000) {
    return cachedToken.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.PROKERALA_CLIENT_ID!,
    client_secret: env.PROKERALA_CLIENT_SECRET!,
  });

  const response = await fetch(new URL("token", getBaseUrl(env)), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.access_token) {
    throw new ProkeralaApiError(parseErrorMessage(payload), response.status, payload);
  }

  const expiresInSeconds = typeof payload.expires_in === "number" ? payload.expires_in : 3600;
  cachedToken = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };

  return payload.access_token;
};

export const buildAstrologyUrl = (
  env: ProkeralaEnv,
  endpointPath: string,
  params: Record<string, string | undefined>
) => {
  const url = new URL(endpointPath, getBaseUrl(env));
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url;
};

export const callProkerala = async (
  env: ProkeralaEnv,
  endpointPath: string,
  params: Record<string, string | undefined>
) => {
  const token = await fetchAccessToken(env);
  const url = buildAstrologyUrl(env, endpointPath, params);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ProkeralaApiError(parseErrorMessage(payload), response.status, payload);
  }

  return payload;
};

export const resolveEndpointPath = (preferredPath: string | undefined, fallbackPath: string) =>
  preferredPath?.trim() || fallbackPath;

export const unwrapProkeralaData = <T = Record<string, unknown>>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    const record = payload as { data?: T };
    if (record.data) {
      return record.data;
    }
  }

  return payload as T;
};

export const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

export const pickFirst = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }

  return null;
};

export const jsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    ...init,
  });

export const errorResponse = (error: unknown) => {
  if (error instanceof ProkeralaConfigError) {
    return jsonResponse(
      {
        status: "unconfigured",
        message: error.message,
      },
      { status: 503 }
    );
  }

  if (error instanceof ProkeralaApiError) {
    return jsonResponse(
      {
        status: "error",
        message: error.message,
        details: error.details,
      },
      { status: error.status || 502 }
    );
  }

  return jsonResponse(
    {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown server error.",
    },
    { status: 500 }
  );
};

export const firstItem = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export const asArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
};

export const coerceString = (value: unknown): string | null => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return value.toISOString();
  return null;
};

export const formatDateTime = (value: unknown, options?: Intl.DateTimeFormatOptions): string | null => {
  if (!value) return null;

  if (typeof value === "string" && !value.includes("T") && !value.includes(":")) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return coerceString(value);

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: options?.dateStyle ?? undefined,
    timeStyle: options?.timeStyle ?? "short",
    ...options,
  }).format(date);
};

export const formatTimeRange = (period: unknown): string | null => {
  if (!period || typeof period !== "object") return null;

  const record = period as { start?: unknown; end?: unknown };
  const start = formatDateTime(record.start, { timeStyle: "short" });
  const end = formatDateTime(record.end, { timeStyle: "short" });

  if (!start || !end) return null;
  return `${start} - ${end}`;
};

export const getLocationParams = (request: Request) => {
  const url = new URL(request.url);
  return {
    coordinates: url.searchParams.get("coordinates") || undefined,
    datetime: url.searchParams.get("datetime") || undefined,
    ayanamsa: url.searchParams.get("ayanamsa") || undefined,
    timezone: url.searchParams.get("timezone") || undefined,
    la: url.searchParams.get("la") || undefined,
    resultType: url.searchParams.get("resultType") || undefined,
    chartType: url.searchParams.get("chartType") || undefined,
    chartStyle: url.searchParams.get("chartStyle") || undefined,
  };
};
