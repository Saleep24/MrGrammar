// Vercel Serverless Function - proxies grammar requests to AI providers
// API keys are stored as Vercel environment variables (secrets), never exposed to clients.
// Primary: Gemini 2.5 Flash Lite | Fallback: Groq (Llama)

import { createHash, timingSafeEqual } from "node:crypto";

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const PROVIDER_TIMEOUT_MS = 10000;
const RATE_LIMIT_PER_MINUTE = 10;
const RATE_LIMIT_PER_DAY = 500;
const GLOBAL_LIMIT_PER_DAY = 20000;
const REDIS_TIMEOUT_MS = 2000;
const MAX_INPUT_CHARS = 10000;
const MAX_OUTPUT_TOKENS = 8192;
const STORE_EXTENSION_ID = "jpecnjmadbehcdpnlfdoobfbohajpdel";
const BUSY = { allowed: false, retryAfter: 60, error: "Service is busy. Try again in a minute." };

const SYSTEM_PROMPT = `You are a grammar-only correction tool. Your ONLY job is to fix:
- Spelling errors
- Grammar errors (subject-verb agreement, tense, articles, pronouns)
- Punctuation errors

STRICT RULES:
- DO NOT change word choice (even if a "better" word exists)
- DO NOT restructure sentences
- DO NOT add or remove words unless grammatically necessary
- DO NOT change tone, formality, or style
- DO NOT "improve" or "enhance" the writing
- PRESERVE intentional repetition, casual language, and stylistic choices
- If the text is already grammatically correct, return it unchanged

EXAMPLES:
Input: "I goes to the store yesterday and buyed milk"
Output: "I went to the store yesterday and bought milk"

Input: "The data shows that users prefers the new design"
Output: "The data shows that users prefer the new design"

Input: "Me and him went to the meeting"
Output: "He and I went to the meeting"

Input: "Their going to there house over they're"
Output: "They're going to their house over there"

Input: "This is really really important!!!"
Output: "This is really really important!!!"
(No change - repetition and exclamation marks are stylistic choices, not errors)

Input: "I wanna grab some food cuz im hungry"
Output: "I wanna grab some food cuz I'm hungry"
(Only fixed capitalization of "I'm" - preserved casual tone and slang)

Return ONLY the corrected text with no explanations, comments, or quotation marks.`;

// True only when the sha256 of the sent code matches ACCESS_CODE_HASH
function hasValidAccessCode(code) {
  const expected = process.env.ACCESS_CODE_HASH;
  if (!expected || typeof code !== "string" || !code) return false;
  const actual = createHash("sha256").update(code).digest("hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

// The store build plus any IDs listed in ALLOWED_EXTENSION_IDS (dev builds, other stores)
function isAllowedOrigin(origin) {
  if (!origin) return false;
  const ids = [STORE_EXTENSION_ID, ...(process.env.ALLOWED_EXTENSION_IDS || "").split(",")];
  return ids.some(id => id.trim() && origin === `chrome-extension://${id.trim()}`);
}

// A fix is never longer than its input, so the ceiling follows the input size
function outputTokenCap(text) {
  return Math.min(MAX_OUTPUT_TOKENS, Math.ceil(text.length / 2) + 64);
}

// Counts requests in Upstash Redis. Fails closed when Redis cannot answer, so an outage never removes the limits.
async function checkRateLimit(ip) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.warn("Rate limiting is off: KV_REST_API_URL / KV_REST_API_TOKEN not set");
    return { allowed: true };
  }

  const now = Date.now();
  const minuteKey = `rl:m:${ip}:${Math.floor(now / 60000)}`;
  const day = new Date(now).toISOString().slice(0, 10);
  const dayKey = `rl:d:${ip}:${day}`;
  const globalKey = `rl:g:${day}`;

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        ["INCR", minuteKey], ["EXPIRE", minuteKey, "90"],
        ["INCR", dayKey], ["EXPIRE", dayKey, "90000"],
        ["INCR", globalKey], ["EXPIRE", globalKey, "90000"]
      ])
    });
    if (!response.ok) throw new Error(`Redis ${response.status}`);

    const results = await response.json();
    const perMinute = results[0]?.result;
    const perDay = results[2]?.result;
    const global = results[4]?.result;
    if (typeof perMinute !== "number" || typeof perDay !== "number" || typeof global !== "number") {
      throw new Error("Unexpected Redis reply");
    }

    if (perMinute > RATE_LIMIT_PER_MINUTE) {
      return { allowed: false, retryAfter: 60, error: "Too many requests. Try again in a minute." };
    }
    if (perDay > RATE_LIMIT_PER_DAY) {
      return { allowed: false, retryAfter: 3600, error: "Daily limit reached. Try again tomorrow." };
    }
    if (global > GLOBAL_LIMIT_PER_DAY) {
      return { allowed: false, retryAfter: 3600, error: "Service is at capacity today. Try again tomorrow." };
    }
    return { allowed: true };
  } catch (error) {
    console.error("Rate limit check failed, refusing request:", error.message);
    return BUSY;
  }
}

// Primary: Gemini
async function callGemini(text, apiKey) {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT + "\n\nText to correct:\n" + text }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: outputTokenCap(text)
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini error: ${err?.error?.message || response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

// Fallback: Groq
async function callGroq(text, apiKey) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text }
      ],
      temperature: 0.2,
      max_tokens: outputTokenCap(text)
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Groq error: ${err?.error?.message || response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

export default async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin || "";
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Access-Code");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const unlimited = hasValidAccessCode(req.headers["x-access-code"]);
  if (!unlimited && !isAllowedOrigin(origin)) {
    return res.status(403).json({ error: "This service only accepts requests from the MrGrammar extension." });
  }

  const text = req.body && typeof req.body === "object" ? req.body.text : undefined;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'text' field" });
  }

  if (text.length > MAX_INPUT_CHARS) {
    return res.status(400).json({ error: "Text too long (max 10,000 characters)" });
  }

  if (!unlimited) {
    const ip = String(req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
    const limit = await checkRateLimit(ip);
    if (!limit.allowed) {
      res.setHeader("Retry-After", String(limit.retryAfter));
      return res.status(limit === BUSY ? 503 : 429).json({ error: limit.error });
    }
  }

  // Try Gemini first, fall back to Groq
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    console.error("No API keys configured (GEMINI_API_KEY / GROQ_API_KEY)");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Attempt 1: Gemini
  let emptyResponse = false;
  if (geminiKey) {
    try {
      const result = await callGemini(text, geminiKey);
      if (result) {
        return res.status(200).json({ correctedText: result, provider: "gemini", unlimited });
      }
      emptyResponse = true;
    } catch (error) {
      console.error("Gemini failed, trying fallback:", error.message);
    }
  }

  // Attempt 2: Groq fallback
  if (groqKey) {
    try {
      const result = await callGroq(text, groqKey);
      if (result) {
        return res.status(200).json({ correctedText: result, provider: "groq", unlimited });
      }
      emptyResponse = true;
    } catch (error) {
      console.error("Groq fallback also failed:", error.message);
    }
  }

  // A provider answered but had nothing to return (e.g. safety block): leave text unchanged
  if (emptyResponse) {
    return res.status(200).json({ correctedText: text, provider: "none", unlimited });
  }

  return res.status(502).json({ error: "All AI providers are currently unavailable. Please try again in a moment." });
}
