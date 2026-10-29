// Admin session token: "<expiry>.<HMAC-SHA256 signature>".
// Uses Web Crypto only, so it runs in both middleware (edge) and Node.

export const SESSION_COOKIE = "ap_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

async function getKey(): Promise<CryptoKey | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const out = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export async function createSessionToken(): Promise<string> {
  const key = await getKey();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is missing or shorter than 32 characters.");
  const payload = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expiry = Number(payload);
  if (!Number.isFinite(expiry) || expiry < Date.now() / 1000) return false;
  const key = await getKey();
  const sigBytes = fromBase64Url(sig);
  if (!key || !sigBytes) return false;
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));
}
