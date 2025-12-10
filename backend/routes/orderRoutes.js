// backend/routes/orderRoutes.js
const { authAdmin } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const Order = require("../models/order");

// POST /api/orders  -> create new order
router.post("/", async (req, res) => {
  console.log("POST /api/orders body:", req.body);

  try {
    const { customerName, email, phone, address, note, items } = req.body;

    if (!customerName || !phone || !address || !Array.isArray(items) || !items.length) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields or empty cart.",
      });
    }

    // calculate total & map items
    const mappedItems = items.map((it) => ({
      menuItem: it._id, // Mongo _id of menu item
      name: it.name,
      price: it.price,
      quantity: it.quantity,
    }));

    const totalAmount = mappedItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    const order = await Order.create({
      customerName,
      email,
      phone,
      address,
      note,
      items: mappedItems,
      totalAmount,
    });

    res.status(201).json({
      status: "ok",
      message: "Order placed successfully",
      data: order,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to create order",
    });
  }
});

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

module.exports = router;
