// Vercel Serverless Function — proxies grammar requests to AI providers
// API keys are stored as Vercel environment variables (secrets), never exposed to clients.
// Primary: Gemini 2.5 Flash Lite | Fallback: Groq (Llama)

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

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

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return origin.startsWith("chrome-extension://");
}

// Primary: Gemini
async function callGemini(text, apiKey) {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
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
        maxOutputTokens: 8192
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
      max_tokens: 8192
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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'text' field" });
  }

  if (text.length > 10000) {
    return res.status(400).json({ error: "Text too long (max 10,000 characters)" });
  }

  // Try Gemini first, fall back to Groq
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    console.error("No API keys configured (GEMINI_API_KEY / GROQ_API_KEY)");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Attempt 1: Gemini
  if (geminiKey) {
    try {
      const result = await callGemini(text, geminiKey);
      if (result) {
        return res.status(200).json({ correctedText: result, provider: "gemini" });
      }
    } catch (error) {
      console.error("Gemini failed, trying fallback:", error.message);
    }
  }

  // Attempt 2: Groq fallback
  if (groqKey) {
    try {
      const result = await callGroq(text, groqKey);
      if (result) {
        return res.status(200).json({ correctedText: result, provider: "groq" });
      }
    } catch (error) {
      console.error("Groq fallback also failed:", error.message);
    }
  }

  return res.status(502).json({ error: "All AI providers are currently unavailable. Please try again in a moment." });
}
