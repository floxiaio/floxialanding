"use client";

import { useEffect, useRef, useState } from "react";
import {
  PENDING_STORAGE_KEY,
  canonicalPageUrl,
  errorMessage,
  isAcknowledged,
  normalizeFields,
  prepareSubmission,
  restorePending,
  retryAfterSeconds,
  serializePending,
  validateFields,
} from "./contact-form-state.mjs";

const INITIAL_NOTICE = { phase: "idle", message: "Cuéntanos tu idea y nos pondremos en contacto contigo." };
const SUCCESS_NOTICE = { phase: "success", message: "Gracias. Recibimos tu solicitud y nos pondremos en contacto contigo." };
const REQUEST_TIMEOUT_MS = 20_000;

export default function ContactForm() {
  const formRef = useRef(null);
  const statusRef = useRef(null);
  const pendingRef = useRef(null);
  const requestRef = useRef(null);
  const sendingRef = useRef(false);
  const retryUntilRef = useRef(0);
  const mountedRef = useRef(false);
  const [notice, setNotice] = useState(INITIAL_NOTICE);
  const [retrySeconds, setRetrySeconds] = useState(0);

  useEffect(() => {
    mountedRef.current = true;
    try {
      const saved = window.sessionStorage.getItem(PENDING_STORAGE_KEY);
      const pending = restorePending(saved);
      if (pending) {
        pendingRef.current = pending;
        for (const field of ["name", "email", "need", "website"]) {
          formRef.current.elements.namedItem(field).value = pending[field];
        }
      } else if (saved) {
        window.sessionStorage.removeItem(PENDING_STORAGE_KEY);
      }
    } catch {
      // Storage can be unavailable in a private or restricted browser session.
    }
    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!retrySeconds) return undefined;
    const timer = window.setTimeout(() => {
      setRetrySeconds(Math.max(0, Math.ceil((retryUntilRef.current - Date.now()) / 1000)));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [retrySeconds]);

  useEffect(() => {
    if ((notice.phase === "error" || notice.phase === "success") && !notice.field) {
      statusRef.current?.focus();
    }
  }, [notice]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (sendingRef.current || Date.now() < retryUntilRef.current) return;

    const data = new FormData(event.currentTarget);
    const fields = normalizeFields(Object.fromEntries(data));
    const invalid = validateFields(fields);
    if (invalid) {
      setNotice({ phase: "error", ...invalid });
      if (invalid.field) formRef.current.elements.namedItem(invalid.field)?.focus();
      return;
    }

    let payload;
    try {
      payload = prepareSubmission({
        fields,
        pageUrl: canonicalPageUrl(window.location),
        previous: pendingRef.current,
        createId: () => window.crypto.randomUUID(),
      });
    } catch {
      setNotice({ phase: "error", message: "No pudimos preparar tu solicitud. Abre la página de inicio e inténtalo de nuevo." });
      return;
    }

    sendingRef.current = true;
    pendingRef.current = payload;
    setNotice({ phase: "sending", message: "Enviando tu solicitud…" });
    try {
      window.sessionStorage.setItem(PENDING_STORAGE_KEY, serializePending(payload));
    } catch {
      // In-memory retries still retain the same submission ID when storage fails.
    }

    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const body = await response.json().catch(() => null);
      if (!mountedRef.current) return;

      if (isAcknowledged(response.status, body, payload.submission_id)) {
        try {
          window.sessionStorage.removeItem(PENDING_STORAGE_KEY);
        } catch {
          // The server acknowledgement, not local storage, determines success.
        }
        setNotice(SUCCESS_NOTICE);
      } else if (response.status === 429) {
        const seconds = retryAfterSeconds(response.headers.get("Retry-After"));
        retryUntilRef.current = Date.now() + seconds * 1000;
        setRetrySeconds(seconds);
        setNotice({ phase: "error", message: `Hemos recibido varios intentos. Espera ${seconds} segundos antes de volver a intentarlo. Tus datos siguen aquí.` });
      } else {
        setNotice({ phase: "error", message: errorMessage(response.status) });
      }
    } catch {
      if (mountedRef.current) setNotice({ phase: "error", message: errorMessage() });
    } finally {
      window.clearTimeout(timeout);
      sendingRef.current = false;
      requestRef.current = null;
    }
  }

  const sending = notice.phase === "sending";
  const disabled = sending || retrySeconds > 0 || notice.phase === "success";
  const buttonText = sending ? "Enviando…" : retrySeconds > 0 ? `Reintentar en ${retrySeconds} s` : notice.phase === "success" ? "Solicitud enviada" : notice.phase === "error" ? "Volver a intentarlo" : "Hablemos de tu proyecto";

  return <form
    ref={formRef}
    className="contact-form"
    data-reveal="rise"
    aria-busy={sending}
    aria-describedby="contact-status"
    onSubmit={handleSubmit}
    onInput={() => { if (notice.phase !== "idle" && !sendingRef.current) setNotice(INITIAL_NOTICE); }}
  >
    <label htmlFor="name">Nombre</label>
    <input id="name" name="name" autoComplete="name" maxLength={120} readOnly={sending} aria-invalid={notice.field === "name" || undefined} aria-describedby={notice.field === "name" ? "contact-status" : undefined} required />
    <label htmlFor="email">Correo electrónico</label>
    <input id="email" name="email" type="email" autoComplete="email" maxLength={254} readOnly={sending} aria-invalid={notice.field === "email" || undefined} aria-describedby={notice.field === "email" ? "contact-status" : undefined} required />
    <label htmlFor="need">¿Qué quieres mejorar o construir?</label>
    <textarea id="need" name="need" rows="3" placeholder="Cuéntanos brevemente tu necesidad." maxLength={5000} readOnly={sending} aria-invalid={notice.field === "need" || undefined} aria-describedby={notice.field === "need" ? "contact-status" : undefined} required />
    <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" }}>
      <label htmlFor="contact-website">Sitio web</label>
      <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" maxLength={200} readOnly={sending} />
    </div>
    <button className="button button--primary" type="submit" disabled={disabled} style={disabled ? { opacity: 0.72, cursor: sending ? "wait" : "default" } : undefined}>{buttonText} <span aria-hidden="true">↗</span></button>
    <p id="contact-status" ref={statusRef} className="preview-note" role="status" aria-live="polite" aria-atomic="true" tabIndex={-1}>{notice.message}</p>
  </form>;
}
