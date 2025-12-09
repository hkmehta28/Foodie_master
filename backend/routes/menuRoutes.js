// backend/routes/menuRoutes.js
const express = require("express");
const router = express.Router();

const MenuItem = require("../models/MenuItem");

// GET /api/menu
// Optional query param: ?category=Burger
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) {
      // simple case-insensitive match could be done with regex, 
      // but for now let's do exact match or whatever user expects.
      // Front-end sends "Burger", "Pizza", etc.
      query.category = category;
    }

    const items = await MenuItem.find(query);
    res.json(items); // send array directly as expected by frontend
  } catch (err) {
    console.error("Error fetching menu:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
