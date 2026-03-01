// src/routes/chat.routes.js
const express = require("express");
const { chat } = require("../controllers/chat.controller");

const router = express.Router();

// POST /api/chat
router.post("/", chat);

module.exports = router;
