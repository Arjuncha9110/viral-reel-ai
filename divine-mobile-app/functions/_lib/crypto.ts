const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const isLocalRequest = (request: Request): boolean => {
  const hostname = new URL(request.url).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
};

export const getPaymentTokenSecret = (
  request: Request,
  secret?: string,
): { ok: true; secret: string } | { ok: false; message: string } => {
  if (secret) return { ok: true, secret };
  if (isLocalRequest(request)) return { ok: true, secret: "local_dev_payment_token_secret" };
  return { ok: false, message: "Payment token secret is not configured." };
};

const toBase64Url = (value: string): string => {
  const bytes = textEncoder.encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value: string): string => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return textDecoder.decode(bytes);
};

const hmacHex = async (value: string, secret: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, textEncoder.encode(value));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
};

export async function signToken(payload: object, secret: string): Promise<string> {
  const data = { ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 };
  const payloadB64 = toBase64Url(JSON.stringify(data));
  const signatureHex = await hmacHex(payloadB64, secret);
  return `${payloadB64}.${signatureHex}`;
}

export async function verifyToken(token: string, secret: string): Promise<Record<string, unknown> | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signatureHex] = parts;
  const expectedSigHex = await hmacHex(payloadB64, secret);

  if (!timingSafeEqual(expectedSigHex, signatureHex)) {
    return null;
  }

  try {
    const payloadStr = fromBase64Url(payloadB64);
    const data = JSON.parse(payloadStr);
    if (data.exp && data.exp < Date.now()) {
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

export async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSigHex = await hmacHex(`${orderId}|${paymentId}`, secret);
  return timingSafeEqual(expectedSigHex, signature);
}
