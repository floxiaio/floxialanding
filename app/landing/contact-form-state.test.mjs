import test from "node:test";
import assert from "node:assert/strict";
import {
  PENDING_MAX_AGE_MS,
  canonicalPageUrl,
  isAcknowledged,
  normalizeFields,
  prepareSubmission,
  restorePending,
  retryAfterSeconds,
  serializePending,
  validateFields,
} from "./contact-form-state.mjs";

const ID_ONE = "44dfcb76-6c09-4d54-802d-809a6e8f3c13";
const ID_TWO = "df1b3c10-8dbb-4da1-8e1b-abda7059d1ef";
const NOW = Date.UTC(2026, 8, 22, 12);
const fields = normalizeFields({ name: "  Prueba sintética  ", email: "TEST@EXAMPLE.COM ", need: "  Revisar un proceso. ", website: "" });
const initial = () => prepareSubmission({ fields, pageUrl: "https://www.floxia.io/?caso=mobilet", createId: () => ID_ONE });

test("normalization and limits reject blank or oversized data and preserve message lines", () => {
  assert.equal(fields.name, "Prueba sintética");
  assert.equal(fields.email, "test@example.com");
  assert.equal(validateFields(fields), null);
  assert.equal(validateFields(normalizeFields({ ...fields, name: "   " })).field, "name");
  assert.equal(validateFields({ ...fields, name: "a".repeat(121) }).field, "name");
  assert.equal(validateFields({ ...fields, name: "Name\nSecond" }).field, "name");
  assert.equal(validateFields({ ...fields, email: "invalid" }).field, "email");
  assert.equal(validateFields({ ...fields, email: `${"a".repeat(243)}@example.com` }).field, "email");
  assert.equal(validateFields({ ...fields, need: "a".repeat(5001) }).field, "need");
  assert.equal(validateFields({ ...fields, need: "Primera línea.\nSegunda línea." }), null);
  assert.equal(validateFields({ ...fields, need: "Null\u0000" }).field, "need");
  assert.equal(validateFields({ ...fields, need: "Delete\u007f" }).field, "need");
});

test("email rules reject malformed local parts and domain labels consistently with the server", () => {
  for (const email of [
    "a@example..com", "a@.example.com", "a,b@example.com", ".a@example.com",
    "a.@example.com", "a..b@example.com", "a@-example.com", "a@example-.com",
    `${"a".repeat(65)}@example.com`, `a@${"b".repeat(64)}.com`,
  ]) {
    assert.equal(validateFields({ ...fields, email }).field, "email", email);
  }
  for (const email of ["a+b@example.com", "a.b@sub.example.com", `${"a".repeat(64)}@example.com`]) {
    assert.equal(validateFields({ ...fields, email }), null, email);
  }
});

test("an unchanged retry keeps UUID and original page URL even after navigation", () => {
  const previous = initial();
  const retried = prepareSubmission({ fields, pageUrl: "https://www.floxia.io/", previous, createId: () => { throw new Error("Must not generate another ID"); } });
  assert.equal(retried, previous);
  assert.equal(retried.page_url, "https://www.floxia.io/?caso=mobilet");
});

test("a meaningful edit receives a new UUID while trim and email case do not", () => {
  const previous = initial();
  const normalizedAgain = normalizeFields({ ...fields, name: ` ${fields.name} `, email: fields.email.toUpperCase() });
  assert.equal(prepareSubmission({ fields: normalizedAgain, pageUrl: previous.page_url, previous, createId: () => ID_TWO }).submission_id, ID_ONE);
  for (const key of ["name", "email", "need", "website"]) {
    const changed = { ...fields, [key]: key === "email" ? "other@example.com" : `${fields[key]} changed` };
    assert.equal(prepareSubmission({ fields: changed, pageUrl: previous.page_url, previous, createId: () => ID_TWO }).submission_id, ID_TWO);
  }
});

test("page URL always uses public canonical origin and excludes location hash", () => {
  assert.equal(canonicalPageUrl({ origin: "http://localhost:3000", pathname: "/", search: "?caso=mobilet", hash: "#contacto" }), "https://www.floxia.io/?caso=mobilet");
  assert.throws(() => canonicalPageUrl({ pathname: "/", search: `?x=${"x".repeat(2048)}` }));
  assert.throws(() => prepareSubmission({ fields, pageUrl: "https://evil.example/", createId: () => ID_ONE }));
  assert.throws(() => prepareSubmission({ fields, pageUrl: "https://www.floxia.io/", createId: () => "invalid" }));
});

test("pending attempts restore only bounded, valid payloads within 24 hours", () => {
  const payload = initial();
  const restored = restorePending(serializePending(payload, NOW), NOW + 60_000);
  assert.deepEqual(restored, payload);
  assert.equal(prepareSubmission({ fields, pageUrl: "https://www.floxia.io/", previous: restored, createId: () => ID_TWO }).submission_id, ID_ONE);
  assert.equal(restorePending(serializePending(payload, NOW), NOW + PENDING_MAX_AGE_MS + 1), null);
  assert.equal(restorePending(serializePending(payload, NOW + 120_000), NOW), null);
  assert.equal(restorePending("{invalid", NOW), null);
  assert.equal(restorePending(null, NOW), null);
  assert.equal(restorePending(serializePending({ ...payload, submission_id: "invalid" }, NOW), NOW), null);
  assert.equal(restorePending(serializePending({ ...payload, page_url: "https://evil.example/" }, NOW), NOW), null);
  assert.equal(restorePending(serializePending({ ...payload, need: "x".repeat(5001) }, NOW), NOW), null);
  assert.equal(restorePending(serializePending({ ...payload, email: payload.email.toUpperCase() }, NOW), NOW), null);
  assert.deepEqual(restorePending(serializePending({ ...payload, secret: "unexpected" }, NOW), NOW), payload);
});

test("success requires a durable success status and matching acknowledgement", () => {
  const acknowledged = { ok: true, submission_id: ID_ONE };
  assert.equal(isAcknowledged(201, acknowledged, ID_ONE), true);
  assert.equal(isAcknowledged(200, acknowledged, ID_ONE), true);
  for (const status of [202, 204, 400, 401, 409, 429, 500, 503]) assert.equal(isAcknowledged(status, acknowledged, ID_ONE), false);
  for (const body of [null, {}, { ok: true }, { ok: "true", submission_id: ID_ONE }, { ok: false, submission_id: ID_ONE }, { ok: true, submission_id: ID_TWO }]) {
    assert.equal(isAcknowledged(200, body, ID_ONE), false);
  }
});

test("Retry-After supports seconds and dates with safe fallback and bounds", () => {
  assert.equal(retryAfterSeconds("120", NOW), 120);
  assert.equal(retryAfterSeconds(new Date(NOW + 30_000).toUTCString(), NOW), 30);
  assert.equal(retryAfterSeconds("0", NOW), 1);
  assert.equal(retryAfterSeconds("9999999", NOW), 86_400);
  for (const value of [null, "", "invalid"]) assert.equal(retryAfterSeconds(value, NOW), 60);
});
