// backend/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: { type: String, required: true }, // menu item name (for convenience)
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    customerName: { type: String, required: false }, // made optional as we might have customerId
    email: { type: String, default: "" },
    phone: { type: String, required: false, default: "" },
    address: { type: String, required: false, default: "" },
    note: { type: String },
    status: { type: String, default: "pending" },

    items: [orderItemSchema],

    totalAmount: { type: Number, required: true, default: 0 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "out-for-delivery", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);


module.exports = Order;
