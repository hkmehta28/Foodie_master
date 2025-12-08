// backend/models/MenuItem.js

const mongoose = require("mongoose");

// Define the structure of a menu item
const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // must have a name
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true, // e.g. "Burger", "Pizza", "Drinks", "Sandwich"
    },
    imageUrl: {
      type: String, // URL to image (we'll match with your frontend later)
      required: false,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;
