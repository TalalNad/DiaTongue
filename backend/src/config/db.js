// src/config/db.js
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI is not defined in .env");
    process.exit(1);
  }

  console.log("🌐 Connecting to MongoDB...");
  console.log(`🔗 MONGO_URI: ${uri}`);

  try {
    // These options help with compatibility; they don't affect DNS
    await mongoose.connect(uri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");
    const { host, name } = mongoose.connection;
    console.log(`📦 DB Name: ${name}`);
    console.log(`🖥  Host: ${host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
}

module.exports = connectDB;