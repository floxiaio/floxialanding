import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createBurstGuard, handleLead } from "../lib/leads-server.mjs";

const id = "76f95210-0962-4dda-98b6-8f1878ae9b3a";
const payload = { submission_id: id, name: " Prueba sintética ", email: " TEST@example.invalid ", need: " Mensaje de prueba ", page_url: "https://www.floxia.io/?caso=mobilet", website: "" };
const env = { NODE_ENV: "production", VERCEL: "1", FLOXIA_LEADS_WEBHOOK_URL: "https://receiver.example.invalid/landing-leads", FLOXIA_LEADS_WEBHOOK_SECRET: "fake-test-secret-not-for-production-123456789" };
function request(data = payload, headers = {}) {
  return new Request("https://www.floxia.io/api/leads", { method: "POST", headers: { origin: "https://www.floxia.io", "content-type": "application/json", "x-vercel-forwarded-for": "203.0.113.10", ...headers }, body: typeof data === "string" ? data : JSON.stringify(data) });
}
function call(req = request(), options = {}) {
  return handleLead(req, { env, guard: () => true, fetcher: async () => Response.json({ ok: true, submission_id: id }, { status: 201 }), ...options });
}

test("forwards normalized contract with private auth and trusted IP hash; returns only acknowledgement", async () => {
  const response = await call(request({ ...payload, source: "attacker", client_ip_hash: "forged", owner: "visitor" }), { fetcher: async (url, init) => {
    assert.equal(url, env.FLOXIA_LEADS_WEBHOOK_URL);
    assert.equal(init.headers.Authorization, `Bearer ${env.FLOXIA_LEADS_WEBHOOK_SECRET}`);
    assert.equal(init.redirect, "error");
    assert.ok(init.signal instanceof AbortSignal);
    assert.deepEqual(JSON.parse(init.body), { schema_version: 1, submission_id: id, name: "Prueba sintética", email: "test@example.invalid", message: "Mensaje de prueba", page_url: payload.page_url, source: "floxia.io", client_ip_hash: createHmac("sha256", env.FLOXIA_LEADS_WEBHOOK_SECRET).update("203.0.113.10").digest("hex") });
    return Response.json({ ok: true, submission_id: id, internal_customer: "never disclose" }, { status: 201 });
  } });
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { ok: true, submission_id: id });
});

test("same UUID and content survive retries and receiver 200 is accepted", async () => {
  const sent = [];
  const fetcher = async (_, init) => { sent.push(JSON.parse(init.body)); return Response.json({ ok: true, submission_id: id }, { status: sent.length === 1 ? 201 : 200 }); };
  assert.equal((await call(request(), { fetcher })).status, 201);
  assert.equal((await call(request(), { fetcher })).status, 200);
  assert.deepEqual(sent[0], sent[1]);
});

test("invalid input never reaches receiver", async () => {
  const invalid = [null, [], {}, { ...payload, submission_id: "123" }, { ...payload, name: " " }, { ...payload, name: "a".repeat(121) }, { ...payload, name: "a\nb" }, { ...payload, email: "invalid" }, { ...payload, email: `a${"b".repeat(245)}@email.io` }, { ...payload, need: " " }, { ...payload, need: "x".repeat(5001) }, { ...payload, website: "bot" }, { ...payload, page_url: "https://www.floxia.io.evil.test/" }, { ...payload, page_url: "https://user:pass@www.floxia.io/" }, { ...payload, page_url: "https://www.floxia.io/#secret" }, { ...payload, page_url: `https://www.floxia.io/${"x".repeat(2048)}` }, "{bad json"];
  for (const data of invalid) {
    const response = await call(request(data), { fetcher: () => assert.fail("invalid input forwarded") });
    assert.equal(response.status, 400, JSON.stringify(data)?.slice(0, 90));
  }
});

test("rejects oversized byte bodies, including chunked and multibyte input", async () => {
  for (const req of [request("x".repeat(16385)), request(payload, { "content-length": "16385" }), request({ ...payload, need: "😀".repeat(4000) })]) {
    assert.equal((await call(req, { fetcher: () => assert.fail("oversized body forwarded") })).status, 400);
  }
});

test("enforces origin, content type, fetch metadata and encoding without CORS trust", async () => {
  for (const headers of [{ origin: "https://evil.test" }, { origin: "null" }, { origin: "" }, { "content-type": "text/plain" }, { "sec-fetch-site": "cross-site" }, { "content-encoding": "gzip" }]) {
    assert.equal((await call(request(payload, headers), { fetcher: () => assert.fail("bad request forwarded") })).status, 400);
  }
});

test("rejects malformed email local parts and domain labels at the server boundary", async () => {
  for (const email of ["a@example..com", "a@.example.com", "a,b@example.com", ".a@example.com", "a..b@example.com", "a@-example.com", `${"a".repeat(65)}@example.com`]) {
    assert.equal((await call(request({ ...payload, email }), { fetcher: () => assert.fail("invalid email forwarded") })).status, 400);
  }
});

test("fails closed without private configuration or trustworthy platform IP", async () => {
  for (const settings of [{ ...env, VERCEL: "0" }, { ...env, FLOXIA_LEADS_WEBHOOK_SECRET: "" }, { ...env, FLOXIA_LEADS_WEBHOOK_URL: "http://unsafe.test" }, { ...env, FLOXIA_LEADS_WEBHOOK_URL: "bad" }]) {
    assert.equal((await call(request(), { env: settings, fetcher: () => assert.fail("bad config forwarded") })).status, 503);
  }
  for (const ip of ["", "fake", "203.0.113.1, 203.0.113.2"]) {
    assert.equal((await call(request(payload, { "x-vercel-forwarded-for": ip, "x-forwarded-for": "203.0.113.10" }))).status, 503);
  }
});

test("normalizes equivalent IPv6 and ignores spoofable forwarding header", async () => {
  const hashes = [];
  for (const ip of ["2001:db8::1", "2001:0db8:0:0:0:0:0:1"]) {
    await call(request(payload, { "x-vercel-forwarded-for": ip, "x-forwarded-for": "attacker" }), { fetcher: async (_, init) => { hashes.push(JSON.parse(init.body).client_ip_hash); return Response.json({ ok: true, submission_id: id }); } });
  }
  assert.equal(hashes[0], hashes[1]);
});

test("only a matching durable acknowledgement yields success", async () => {
  for (const [status, body] of [[202, { ok: true, submission_id: id }], [200, { ok: false }], [201, { ok: true, submission_id: "different" }], [500, { secret: "internal" }], [401, { secret: "internal" }]]) {
    const response = await call(request(), { fetcher: async () => Response.json(body, { status }) });
    assert.equal(response.status, 503);
    assert.equal((await response.text()).includes("internal"), false);
  }
  assert.equal((await call(request(), { fetcher: async () => new Response("invalid json") })).status, 503);
  assert.equal((await call(request(), { fetcher: async () => { throw new DOMException("timeout", "TimeoutError"); } })).status, 503);
});

test("safe error mapping preserves conflict and rate-limit semantics", async () => {
  for (const status of [400, 409, 429]) {
    const response = await call(request(), { fetcher: async () => Response.json({ message: "internal" }, { status, headers: { "Retry-After": "120" } }) });
    assert.equal(response.status, status);
    assert.equal((await response.text()).includes("internal"), false);
    if (status === 429) assert.equal(response.headers.get("retry-after"), "120");
  }
});

test("supplemental burst guard limits and expires; rejected bursts never call receiver", async () => {
  const guard = createBurstGuard();
  for (let i = 0; i < 20; i++) assert.equal(guard("key", 0), true);
  assert.equal(guard("key", 1), false);
  assert.equal(guard("different", 1), true);
  assert.equal(guard("key", 60000), true);
  const response = await call(request(), { guard: () => false, fetcher: () => assert.fail("burst forwarded") });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
});

test("preserves daily receiver limits in Retry-After", async () => {
  const response = await call(request(), { fetcher: async () => Response.json({ ok: false }, { status: 429, headers: { "Retry-After": "86400" } }) });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "86400");
});
