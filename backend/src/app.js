const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const predictRoutes = require("./routes/predict.routes"); // ✅ add
const chatRoutes = require("./routes/chat.routes");
const userRoutes = require("./routes/user.routes");
const scanRoutes = require("./routes/scan.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "DiaTongue API is running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/predict", predictRoutes); // ✅ add
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/scans", scanRoutes);

module.exports = app;