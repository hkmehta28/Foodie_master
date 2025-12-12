// backend/routes/orderRoutes.js
const { authAdmin } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const Order = require("../models/order");



// GET /api/orders  -> list all orders (for admin)
router.get("/", authAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      status: "ok",
      data: orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
    });
  }
});

// PATCH /api/orders/:id/status  -> update order status
router.patch("/:id/status", authAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = [
      "pending",
      "confirmed",
      "preparing",
      "out-for-delivery",
      "completed",
      "cancelled",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status value.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found.",
      });
    }

    res.json({
      status: "ok",
      message: "Order status updated.",
      data: order,
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to update order status",
    });
  }
});

const { authUser } = require("../middleware/authUser"); // our user auth middleware
// note: we do NOT apply authUser globally here - use it conditionally inside the handler

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    // If the request has Authorization header + valid token, populate req.user
    // We can call authUser middleware manually to check token without making route protected.
    let customerId = null;
    let customerName = req.body.customerName || "";
    try {
      // If token present, verify and set req.user (authUser expects headers & sets req.user)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        // call authUser-like logic manually to avoid double-route mounting issues
        // simplest: reuse authUser by invoking it
        await new Promise((resolve, reject) => {
          // create a fake next to capture errors
          authUser(req, res, (err) => {
            if (err) return reject(err);
            return resolve();
          });
        });
        if (req.user) {
          customerId = req.user._id;
          // prefer server-side user name if available
          customerName = req.user.name || customerName;
        }
      }
    } catch (e) {
      // invalid token — ignore and proceed as guest order
      console.warn("Order creation: token invalid or missing, creating guest order.");
    }

    // Build order object from request body
    const { items, totalAmount, phone, email, address } = req.body;

    const orderData = {
      items: items || [],
      totalAmount: totalAmount || 0,
      phone: phone || "",
      email: email || "",
      address: address || "",
      customerName: customerName || "",
      status: "pending",
    };

    if (customerId) orderData.customerId = customerId;

    const order = await Order.create(orderData);

    return res.status(201).json({ status: "ok", data: order });
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ status: "error", message: "Failed to create order", detail: err.message });
  }
});


module.exports = router;
