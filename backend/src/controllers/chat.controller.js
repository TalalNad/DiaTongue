// backend/src/controllers/chat.controller.js
const { getChatResponse } = require("../services/chat.service");

async function chat(req, res) {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "message (string) is required",
      });
    }

    const reply = await getChatResponse({ message, history });

    return res.json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Chat failed",
    });
  }
}

module.exports = { chat };