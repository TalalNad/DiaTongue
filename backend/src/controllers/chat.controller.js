// src/controllers/chat.controller.js
const { getChatResponse } = require("../services/chat.service");

/**
 * POST /api/chat
 * Body: { message: string, history?: Array<{ role: "user"|"model", text: string }> }
 */
async function chat(req, res) {
    try {
        const { message, history } = req.body;

        if (!message || typeof message !== "string" || message.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "A non-empty message is required.",
            });
        }

        const reply = await getChatResponse(message.trim(), history || []);

        return res.status(200).json({
            success: true,
            reply,
        });
    } catch (err) {
        console.error("Chat error:", err.message);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to get a response from the assistant.",
        });
    }
}

module.exports = { chat };
