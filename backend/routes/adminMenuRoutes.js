// routes/adminMenuRoutes.js

const express = require("express");
const router = express.Router();

const MenuItem = require("../models/MenuItem");
const { authAdmin } = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");
router.use(adminAuth);


// GET /api/admin/menu
// Get all menu items (for admin dashboard)
router.get("/", authAdmin, async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    return res.json({ status: "ok", data: items });
  } catch (err) {
    console.error("Error fetching menu items (admin):", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to fetch menu items" });
  }
});

// POST /api/admin/menu
// Create a new menu item
router.post("/", authAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      imageUrl,
      isVeg = true,
      isAvailable = true,
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        status: "error",
        message: "name, description, price and category are required",
      });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      imageUrl,
      isVeg,
      isAvailable,
    });

    return res
      .status(201)
      .json({ status: "ok", message: "Menu item created", data: item });
  } catch (err) {
    console.error("Error creating menu item:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to create menu item" });
  }
});

// PUT /api/admin/menu/:id
// Update a menu item
router.put("/:id", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      price,
      category,
      imageUrl,
      isVeg,
      isAvailable,
    } = req.body;

    const updateData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(category !== undefined && { category }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isVeg !== undefined && { isVeg }),
      ...(isAvailable !== undefined && { isAvailable }),
    };

    const updated = await MenuItem.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", message: "Menu item not found" });
    }

    return res.json({
      status: "ok",
      message: "Menu item updated",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating menu item:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to update menu item" });
  }
});

// DELETE /api/admin/menu/:id
// Delete a menu item
router.delete("/:id", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await MenuItem.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ status: "error", message: "Menu item not found" });
    }

    return res.json({
      status: "ok",
      message: "Menu item deleted",
      data: deleted,
    });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to delete menu item" });
  }
});

// Optional: PATCH /api/admin/menu/:id/toggle
// Quick toggle availability
router.patch("/:id/toggle-availability", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findById(id);
    if (!item) {
      return res
        .status(404)
        .json({ status: "error", message: "Menu item not found" });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    return res.json({
      status: "ok",
      message: "Availability toggled",
      data: item,
    });
  } catch (err) {
    console.error("Error toggling availability:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to toggle availability",
    });
  }
});

module.exports = router;
