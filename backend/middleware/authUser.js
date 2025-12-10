// backend/middleware/authUser.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ status: "error", message: "Not authorized" });
    req.user = user;
    next();
  } catch (err) {
    console.error("authUser error:", err);
    return res.status(401).json({ status: "error", message: "Token invalid or expired" });
  }
};

module.exports = { authUser };
