// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const Order = require("../models/order");

router.get("/", async (req, res) => {
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


// POST /api/orders  -> create new order
router.post("/", async (req, res) => {
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

// (Optional) GET /api/orders -> later for admin dashboard


module.exports = router;
