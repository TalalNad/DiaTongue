// backend/src/services/chat.service.js
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// You can change the model anytime
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

async function getChatResponse({ message, history = [] }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in .env");
  }

  // Convert your app history into Groq messages
  // history items expected: { role: "user"|"assistant", content: "..." }
  const messages = [
    {
      role: "system",
      content:
        "You are DiaTongue Assistant, a helpful diabetes health chatbot. " +
        "Be clear, safe, and concise. If user asks for medical diagnosis, advise consulting a clinician.",
    },
    ...(Array.isArray(history) ? history : []),
    { role: "user", content: message },
  ];

  try {
    const completion = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";
    return reply;
  } catch (err) {
    // Common Groq errors: rate limit, auth, etc.
    const status = err?.status || err?.response?.status;
    const msg = err?.message || "Groq request failed";

    // Normalize rate limit
    if (status === 429) {
      throw new Error("The assistant is busy right now. Please try again in a moment.");
    }

    // Normalize auth
    if (status === 401) {
      throw new Error("Groq authentication failed. Check GROQ_API_KEY.");
    }

    throw new Error(msg);
  }
}

module.exports = { getChatResponse };