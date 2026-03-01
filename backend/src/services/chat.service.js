// src/services/chat.service.js
const Groq = require("groq-sdk");

const SYSTEM_PROMPT = `You are DiaTongue Assistant, a friendly and knowledgeable health chatbot specialised exclusively in diabetes (Type 1, Type 2, and gestational diabetes).

Your responsibilities:
- Answer questions about diabetes symptoms, causes, risk factors, prevention, and management.
- Explain concepts like blood glucose, HbA1c, insulin resistance, and lifestyle changes in simple, clear language.
- Provide general dietary and exercise guidance relevant to diabetes management.
- Clarify common misconceptions about diabetes.
- Explain how tongue health and visual biomarkers may relate to metabolic health (relevant to the DiaTongue app).

Your boundaries:
- ONLY discuss topics related to diabetes, blood sugar, metabolic health, and directly related conditions (e.g. hypertension, obesity, cardiovascular risk in the context of diabetes).
- If a user asks about something unrelated, politely redirect them: "I'm specialised in diabetes-related topics. Could I help you with something related to diabetes or blood sugar management instead?"
- Never diagnose or prescribe. Always recommend consulting a qualified healthcare professional for personal medical decisions.
- Keep responses concise, warm, and jargon-free unless the user asks for technical detail.
- Use bullet points or short paragraphs for clarity.
- Always end with a brief disclaimer when giving medical-adjacent information: "Remember, always consult your doctor for personalised medical advice."`;

async function getChatResponse(userMessage, history = []) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured on the server.");
    }

    const groq = new Groq({ apiKey });

    // Build messages array: system prompt + history + new user message
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((item) => ({
            role: item.role === "model" ? "assistant" : "user",
            content: item.text,
        })),
        { role: "user", content: userMessage },
    ];

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages,
            max_tokens: 512,
            temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again.";
    } catch (err) {
        const msg = err?.message || "";
        const status = err?.status || err?.error?.code;

        if (status === 429 || msg.includes("429") || msg.includes("rate limit") || msg.includes("quota")) {
            throw new Error("The assistant is busy right now. Please wait a moment and try again.");
        }
        if (status === 401 || msg.includes("401") || msg.includes("Invalid API Key")) {
            throw new Error("API key error. Please contact the app administrator.");
        }
        throw err;
    }
}

module.exports = { getChatResponse };
