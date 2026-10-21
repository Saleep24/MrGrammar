import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../proxy/api/grammar.js';

const ENV_KEYS = ['GEMINI_API_KEY', 'GROQ_API_KEY', 'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'ACCESS_CODE_HASH'];
let calls;

function reply(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function mockFetch(routes) {
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, body: opts && opts.body ? JSON.parse(opts.body) : null });
    if (url.includes('generativelanguage')) return routes.gemini();
    if (url.includes('groq')) return routes.groq();
    if (url.includes('/pipeline')) return routes.redis();
    throw new Error('unexpected fetch ' + url);
  };
}

function geminiOk(text) {
  return reply(200, { candidates: [{ content: { parts: [{ text }] } }] });
}

function groqOk(text) {
  return reply(200, { choices: [{ message: { content: text } }] });
}

function redisCounts(minute, day, global) {
  return reply(200, [{ result: minute }, { result: 1 }, { result: day }, { result: 1 }, { result: global }, { result: 1 }]);
}

function req(overrides = {}) {
  return {
    method: 'POST',
    headers: { origin: 'chrome-extension://abcdef', ...(overrides.headers || {}) },
    body: 'body' in overrides ? overrides.body : { text: 'I goes to the store.' },
    ...(overrides.method ? { method: overrides.method } : {})
  };
}

function res() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    end() { return this; }
  };
}

beforeEach(() => {
  calls = [];
  for (const k of ENV_KEYS) delete process.env[k];
  process.env.GEMINI_API_KEY = 'gem';
  process.env.GROQ_API_KEY = 'grq';
  mockFetch({ gemini: () => geminiOk('I went to the store.'), groq: () => groqOk('groq text'), redis: () => redisCounts(1, 1, 1) });
});

test('rejects non-POST requests', async () => {
  const r = res();
  await handler(req({ method: 'GET' }), r);
  assert.equal(r.statusCode, 405);
});

test('answers preflight without calling a provider', async () => {
  const r = res();
  await handler(req({ method: 'OPTIONS' }), r);
  assert.equal(r.statusCode, 200);
  assert.equal(calls.length, 0);
});

test('requires a text field', async () => {
  const r = res();
  await handler(req({ body: {} }), r);
  assert.equal(r.statusCode, 400);
});

test('caps text at 10,000 characters', async () => {
  const r = res();
  await handler(req({ body: { text: 'a'.repeat(10001) } }), r);
  assert.equal(r.statusCode, 400);
  assert.equal(calls.length, 0);
});

test('only extension origins get a CORS allow header', async () => {
  const ext = res();
  await handler(req(), ext);
  assert.equal(ext.headers['Access-Control-Allow-Origin'], 'chrome-extension://abcdef');
  const web = res();
  await handler(req({ headers: { origin: 'https://evil.example' } }), web);
  assert.equal(web.headers['Access-Control-Allow-Origin'], undefined);
});

test('returns the Gemini correction and sends the user text', async () => {
  const r = res();
  await handler(req(), r);
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.body, { correctedText: 'I went to the store.', provider: 'gemini', unlimited: false });
  const gemini = calls.find(c => c.url.includes('generativelanguage'));
  assert.ok(gemini.body.contents[0].parts[0].text.includes('I goes to the store.'));
});

test('falls back to Groq when Gemini fails', async () => {
  mockFetch({ gemini: () => reply(500, { error: { message: 'boom' } }), groq: () => groqOk('I went to the store.'), redis: () => redisCounts(1, 1, 1) });
  const r = res();
  await handler(req(), r);
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.provider, 'groq');
});

test('returns 502 when every provider fails', async () => {
  mockFetch({ gemini: () => reply(500, {}), groq: () => reply(500, {}), redis: () => redisCounts(1, 1, 1) });
  const r = res();
  await handler(req(), r);
  assert.equal(r.statusCode, 502);
  assert.match(r.body.error, /unavailable/i);
});

test('returns 500 when no provider key is configured', async () => {
  delete process.env.GEMINI_API_KEY;
  delete process.env.GROQ_API_KEY;
  const r = res();
  await handler(req(), r);
  assert.equal(r.statusCode, 500);
  assert.equal(calls.length, 0);
});

test('leaves text unchanged when the provider returns nothing', async () => {
  mockFetch({ gemini: () => reply(200, { candidates: [] }), groq: () => reply(200, { choices: [] }), redis: () => redisCounts(1, 1, 1) });
  const r = res();
  await handler(req(), r);
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.body, { correctedText: 'I goes to the store.', provider: 'none', unlimited: false });
});

test('skips rate limiting when Redis is not configured', async () => {
  const r = res();
  await handler(req(), r);
  assert.ok(!calls.some(c => c.url.includes('/pipeline')));
});

test('returns 429 with Retry-After past the per-minute limit', async () => {
  process.env.KV_REST_API_URL = 'https://redis.example';
  process.env.KV_REST_API_TOKEN = 'tok';
  mockFetch({ gemini: () => geminiOk('x'), groq: () => groqOk('x'), redis: () => redisCounts(11, 11, 11) });
  const r = res();
  await handler(req(), r);
  assert.equal(r.statusCode, 429);
  assert.equal(r.headers['Retry-After'], '60');
  assert.ok(!calls.some(c => c.url.includes('generativelanguage')));
});

test('returns the daily limit message past the per-day limit', async () => {
  process.env.KV_REST_API_URL = 'https://redis.example';
  process.env.KV_REST_API_TOKEN = 'tok';
  mockFetch({ gemini: () => geminiOk('x'), groq: () => groqOk('x'), redis: () => redisCounts(1, 201, 201) });
  const r = res();
  await handler(req(), r);
  assert.equal(r.statusCode, 429);
  assert.match(r.body.error, /daily limit/i);
});

test('fails open when Redis errors', async () => {
  process.env.KV_REST_API_URL = 'https://redis.example';
  process.env.KV_REST_API_TOKEN = 'tok';
  mockFetch({ gemini: () => geminiOk('ok'), groq: () => groqOk('x'), redis: () => reply(500, {}) });
  const r = res();
  await handler(req(), r);
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.correctedText, 'ok');
});

test('uses the first address in x-forwarded-for for the limit key', async () => {
  process.env.KV_REST_API_URL = 'https://redis.example';
  process.env.KV_REST_API_TOKEN = 'tok';
  const r = res();
  await handler(req({ headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.1' } }), r);
  const redis = calls.find(c => c.url.includes('/pipeline'));
  assert.ok(redis.body[0][1].includes('1.2.3.4'));
  assert.ok(!redis.body[0][1].includes('10.0.0.1'));
});

const CODE = 'test-access-code-1234';
const CODE_HASH = '31bb56478b106542c00f81e2b9a105c72f7bdbbdf014eccb142e59602bfffd8d';

test('a valid access code skips the rate limit and says so', async () => {
  process.env.KV_REST_API_URL = 'https://redis';
  process.env.KV_REST_API_TOKEN = 't';
  process.env.ACCESS_CODE_HASH = CODE_HASH;
  mockFetch({ gemini: () => geminiOk('ok'), groq: () => groqOk('x'), redis: () => redisCounts(999, 999, 999) });
  const r = res();
  await handler(req({ headers: { 'x-access-code': CODE } }), r);
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.unlimited, true);
  assert.ok(!calls.some(c => c.url.includes('/pipeline')));
});

test('a wrong access code behaves exactly like no code', async () => {
  process.env.KV_REST_API_URL = 'https://redis';
  process.env.KV_REST_API_TOKEN = 't';
  process.env.ACCESS_CODE_HASH = CODE_HASH;
  mockFetch({ gemini: () => geminiOk('ok'), groq: () => groqOk('x'), redis: () => redisCounts(999, 1, 1) });
  const r = res();
  await handler(req({ headers: { 'x-access-code': 'nope' } }), r);
  assert.equal(r.statusCode, 429);
  assert.equal(r.body.unlimited, undefined);
});

test('access codes are ignored when no hash is configured', async () => {
  process.env.KV_REST_API_URL = 'https://redis';
  process.env.KV_REST_API_TOKEN = 't';
  mockFetch({ gemini: () => geminiOk('ok'), groq: () => groqOk('x'), redis: () => redisCounts(999, 1, 1) });
  const r = res();
  await handler(req({ headers: { 'x-access-code': CODE } }), r);
  assert.equal(r.statusCode, 429);
});

test('ordinary requests report unlimited as false', async () => {
  const r = res();
  await handler(req(), r);
  assert.equal(r.body.unlimited, false);
});

test('preflight allows the access code header', async () => {
  const r = res();
  await handler(req({ method: 'OPTIONS' }), r);
  assert.match(r.headers['Access-Control-Allow-Headers'], /X-Access-Code/);
});
