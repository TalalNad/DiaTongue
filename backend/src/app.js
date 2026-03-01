// src/app.js
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "DiaTongue API is running 🚀",
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Chat routes
app.use("/api/chat", chatRoutes);

module.exports = app;