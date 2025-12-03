// backend/server.js
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

console.log(`🌱 Loaded env from: ${envPath}`);

const connectDB = require("./src/config/db");
const app = require("./src/app");

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 DiaTongue backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();