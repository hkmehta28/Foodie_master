// backend/middleware/adminAuth.js
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECR || "super_secret_jwt_key_123";

module.exports = async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || "";
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ status: "error", message: "Invalid or expired token" });
    }

    // Try to read admin id from common fields
    const adminId = payload.id || payload._id || payload.adminId;
    if (!adminId) return res.status(401).json({ status: "error", message: "Invalid token payload" });

    // find admin (exclude password)
    const admin = await AdminUser.findById(adminId).select("-password");
    if (!admin) return res.status(403).json({ status: "error", message: "Admin account not found" });

    // attach to request for downstream handlers
    req.admin = admin;
    next();
  } catch (err) {
    console.error("adminAuth error:", err);
    return res.status(500).json({ status: "error", message: "Server error in admin auth" });
  }
};
