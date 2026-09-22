import { createHmac } from "node:crypto";
import { isIP } from "node:net";

const MAX_BYTES = 16 * 1024;
const LANDING_ORIGINS = new Set(["https://www.floxia.io", "https://floxia.io"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const CONTROL = /[\u0000-\u001f\u007f]/;

function json(body, status, headers = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function error(status, code, message, headers) {
  return json({ ok: false, error: { code, message } }, status, headers);
}

async function readJsonLimited(message) {
  const length = Number(message.headers.get("content-length"));
  if (length > MAX_BYTES || !message.body) throw new Error("body");
  const reader = message.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new Error("body");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
}

function allowedRequestOrigin(origin, env) {
  if (LANDING_ORIGINS.has(origin)) return true;
  if (env.VERCEL === "1" && env.VERCEL_URL && origin === `https://${env.VERCEL_URL}`) return true;
  if (env.NODE_ENV === "production") return false;
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
  } catch { return false; }
}

function validate(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const { submission_id, name, email, need, page_url, website } = data;
  if (![submission_id, name, email, need, page_url].every(value => typeof value === "string")) return null;
  if (website !== undefined && website !== "") return null;
  const clean = { name: name.trim(), email: email.trim().toLowerCase(), message: need.trim() };
  if (!UUID.test(submission_id) || clean.name.length < 1 || clean.name.length > 120 || CONTROL.test(clean.name)) return null;
  const localPart = clean.email.split("@")[0];
  if (clean.email.length > 254 || !EMAIL.test(clean.email) || localPart.length > 64 || localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) return null;
  if (clean.message.length < 1 || clean.message.length > 5000 || /[\u0000\u007f]/.test(clean.message)) return null;
  if (page_url.length > 2048) return null;
  try {
    const page = new URL(page_url);
    if (!LANDING_ORIGINS.has(page.origin) || page.username || page.password || page.hash) return null;
  } catch { return null; }
  return { schema_version: 1, submission_id: submission_id.toLowerCase(), ...clean, source: "floxia.io", page_url };
}

function clientIpHash(request, env, secret) {
  // Only trust the header written by Vercel's edge, never a visitor-supplied IP.
  // https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for
  let ip = env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.trim() : null;
  if (env.VERCEL !== "1" && env.NODE_ENV !== "production") ip = "127.0.0.1";
  if (!ip || !isIP(ip)) return null;
  if (isIP(ip) === 6) ip = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
  return createHmac("sha256", secret).update(ip).digest("hex");
}

// Supplemental burst guard, bounded in memory. Durable IP/email/global limits
// are enforced atomically by the receiver, including across server instances.
export function createBurstGuard() {
  const windows = new Map();
  return (key, now = Date.now()) => {
    for (const [storedKey, value] of windows) if (value.until <= now) windows.delete(storedKey);
    const current = windows.get(key);
    if (current) {
      current.count += 1;
      return current.count <= 20;
    }
    if (windows.size >= 10000) return false;
    windows.set(key, { count: 1, until: now + 60000 });
    return true;
  };
}

const burstGuard = createBurstGuard();

export async function handleLead(request, { env = process.env, fetcher = fetch, guard = burstGuard } = {}) {
  const invalid = () => error(400, "INVALID_INPUT", "Revisa tu nombre, correo y mensaje e inténtalo de nuevo.");
  const unavailable = () => error(503, "UNAVAILABLE", "No pudimos confirmar el envío. Conservamos tus datos; vuelve a intentarlo.");
  if (!allowedRequestOrigin(request.headers.get("origin"), env)) return invalid();
  const site = request.headers.get("sec-fetch-site");
  if (site && !["same-origin", "same-site", "none"].includes(site)) return invalid();
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return invalid();
  if (request.headers.has("content-encoding")) return invalid();

  const secret = env.FLOXIA_LEADS_WEBHOOK_SECRET;
  let webhook;
  try {
    webhook = new URL(env.FLOXIA_LEADS_WEBHOOK_URL);
    if (webhook.protocol !== "https:" || webhook.username || webhook.password || webhook.hash) return unavailable();
  } catch { return unavailable(); }
  if (!secret || secret.length < 32) return unavailable();
  const ipHash = clientIpHash(request, env, secret);
  if (!ipHash) return unavailable();
  if (!guard(ipHash)) return error(429, "RATE_LIMITED", "Espera un minuto antes de volver a intentarlo.", { "Retry-After": "60" });

  let payload;
  try { payload = validate(await readJsonLimited(request)); } catch { return invalid(); }
  if (!payload) return invalid();
  payload.client_ip_hash = ipHash;

  try {
    const response = await fetcher(webhook.href, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
      redirect: "error",
      cache: "no-store",
    });
    if (response.status === 429) {
      const raw = response.headers.get("retry-after");
      const seconds = raw && /^\d{1,5}$/.test(raw) ? Math.max(1, Math.min(3600, Number(raw))) : 60;
      return error(429, "RATE_LIMITED", "Hay varios envíos recientes. Espera un momento y vuelve a intentarlo.", { "Retry-After": String(seconds) });
    }
    if (response.status === 409) return error(409, "SUBMISSION_CONFLICT", "No pudimos confirmar este envío. Revisa los datos antes de intentarlo de nuevo.");
    if (response.status === 400) return invalid();
    if (response.status !== 200 && response.status !== 201) return unavailable();
    const result = await readJsonLimited(response);
    if (result?.ok !== true || result.submission_id !== payload.submission_id) return unavailable();
    return json({ ok: true, submission_id: payload.submission_id }, response.status);
  } catch { return unavailable(); }
}
