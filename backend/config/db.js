// backend/db.js
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGO_URI ||
  "YOUR_ATLAS_CONNECTION_STRING_HERE"; // keep your existing working URI here

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // stop app if DB fails
  }
}

module.exports = connectDB;
