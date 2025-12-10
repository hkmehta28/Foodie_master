// backend/routes/usersRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Order = require("../models/order"); // make sure this is your order model path
const { authUser } = require("../middleware/authUser");

// helper to sign token
function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/users/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ status: "error", message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ status: "error", message: "Email already registered" });

    const user = await User.create({ name, email, password, phone, address });

    const token = signToken(user);
    return res.status(201).json({
      status: "ok",
      data: { token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address } },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ status: "error", message: "Registration failed", error: err.message });
  }
});

// POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: "error", message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ status: "error", message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ status: "error", message: "Invalid credentials" });

    const token = signToken(user);
    return res.json({
      status: "ok",
      data: { token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address } },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ status: "error", message: "Login failed" });
  }
});

// GET /api/users/profile  (protected)
router.get("/profile", authUser, async (req, res) => {
  try {
    const user = req.user;
    return res.json({ status: "ok", data: user });
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ status: "error", message: "Failed to get profile" });
  }
});

// PUT /api/users/profile (update user profile) (protected)
router.put("/profile", authUser, async (req, res) => {
  try {
    const user = req.user;
    const { name, phone, address } = req.body;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    await user.save();
    return res.json({ status: "ok", data: user });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ status: "error", message: "Failed to update profile" });
  }
});

// GET /api/users/my-orders (protected) - returns orders placed by this user
router.get("/my-orders", authUser, async (req, res) => {
  try {
    const orders = await Order.find({ "customerId": req.user._id }).sort({ createdAt: -1 });
    return res.json({ status: "ok", data: orders });
  } catch (err) {
    console.error("My orders error:", err);
    return res.status(500).json({ status: "error", message: "Failed to fetch orders" });
  }
});

module.exports = router;
