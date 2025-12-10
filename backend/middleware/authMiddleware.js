// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await AdminUser.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Not authorized (admin not found)" });
    }

    // attach admin to request for later use
    req.admin = admin;
    next();
  } catch (err) {
    console.error("Admin auth error:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { authAdmin };
