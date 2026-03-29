// Vercel Serverless Function — proxies grammar requests to Gemini API
// The GEMINI_API_KEY is stored as a Vercel environment variable (secret), never exposed to clients.

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

// Allowed origins — update after deploying the extension or for local testing
const ALLOWED_ORIGINS = [
  "chrome-extension://"
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return origin.startsWith("chrome-extension://");
}

export default async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin || "";
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'text' field" });
  }

  if (text.length > 10000) {
    return res.status(400).json({ error: "Text too long (max 10,000 characters)" });
  }

  try {
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
          maxOutputTokens: 8192,
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Gemini API error:", err);
      return res.status(502).json({ error: "AI service error. Please try again." });
    }

    const data = await response.json();
    const correctedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;

    return res.status(200).json({ correctedText });
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
