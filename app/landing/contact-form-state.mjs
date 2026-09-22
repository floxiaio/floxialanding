export const PENDING_STORAGE_KEY = "floxia.contact.pending.v1";
export const PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const LANDING_ORIGIN = "https://www.floxia.io";
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;

export function normalizeFields(raw) {
  return {
    name: typeof raw.name === "string" ? raw.name.trim() : "",
    email: typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "",
    need: typeof raw.need === "string" ? raw.need.trim() : "",
    website: typeof raw.website === "string" ? raw.website : "",
  };
}

export function validateFields(fields) {
  if (!fields.name || fields.name.length > 120 || CONTROL_CHARACTER.test(fields.name)) {
    return { field: "name", message: "Escribe tu nombre, de 1 a 120 caracteres." };
  }
  const localPart = fields.email.split("@")[0];
  if (fields.email.length > 254 || !EMAIL.test(fields.email) || localPart.length > 64 || localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return { field: "email", message: "Escribe un correo electrónico válido." };
  }
  if (!fields.need || fields.need.length > 5000 || /[\u0000\u007f]/.test(fields.need)) {
    return { field: "need", message: "Cuéntanos tu necesidad, de 1 a 5000 caracteres." };
  }
  if (fields.website.length > 200) {
    return { message: "No pudimos validar el formulario. Recarga la página e inténtalo de nuevo." };
  }
  return null;
}

function isValidPageUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.origin === LANDING_ORIGIN && !url.username && !url.password && !url.hash;
  } catch {
    return false;
  }
}

export function canonicalPageUrl(location) {
  const value = `${LANDING_ORIGIN}${location.pathname}${location.search}`;
  if (!isValidPageUrl(value)) throw new Error("Invalid page URL");
  return value;
}

export function prepareSubmission({ fields, pageUrl, previous, createId }) {
  if (validateFields(fields) || !isValidPageUrl(pageUrl)) throw new Error("Invalid submission");
  // A retry keeps the exact original page URL, including after a page reload.
  if (previous && ["name", "email", "need", "website"].every((key) => previous[key] === fields[key])) {
    return previous;
  }
  const submissionId = createId();
  if (!UUID_V4.test(submissionId)) throw new Error("Invalid submission ID");
  return { submission_id: submissionId, ...fields, page_url: pageUrl };
}

export function serializePending(payload, now = Date.now()) {
  return JSON.stringify({ saved_at: now, payload });
}

export function restorePending(serialized, now = Date.now()) {
  try {
    const stored = JSON.parse(serialized);
    if (!stored || !Number.isFinite(stored.saved_at) || stored.saved_at > now + 60_000 || now - stored.saved_at > PENDING_MAX_AGE_MS) return null;
    const payload = stored.payload;
    if (!payload || !UUID_V4.test(payload.submission_id) || !isValidPageUrl(payload.page_url)) return null;
    const fields = normalizeFields(payload);
    if (validateFields(fields)) return null;
    if (["name", "email", "need", "website"].some((key) => fields[key] !== payload[key])) return null;
    return { submission_id: payload.submission_id, ...fields, page_url: payload.page_url };
  } catch {
    return null;
  }
}

export function isAcknowledged(status, body, submissionId) {
  return (status === 200 || status === 201) && body?.ok === true && body.submission_id === submissionId;
}

export function retryAfterSeconds(value, now = Date.now()) {
  if (typeof value !== "string" || !value.trim()) return 60;
  const trimmed = value.trim();
  const seconds = /^\d+$/.test(trimmed) ? Number(trimmed) : (Date.parse(trimmed) - now) / 1000;
  if (!Number.isFinite(seconds)) return 60;
  return Math.max(1, Math.min(86_400, Math.ceil(seconds)));
}

export function errorMessage(status) {
  if (status === 400 || status === 413) return "Revisa tu nombre, correo y mensaje antes de volver a enviarlos.";
  if (status === 409) return "Este envío no coincide con el intento anterior. Revisa tus datos antes de volver a enviarlos.";
  return "No pudimos confirmar tu solicitud. Tus datos siguen aquí; puedes volver a intentarlo.";
}
