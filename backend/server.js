// backend/server.js
const express = require("express");
const cors = require("cors");

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

// simple health check
app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;
