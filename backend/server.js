// backend/server.js
const express = require("express");
const cors = require("cors");

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminMenuRoutes = require("./routes/adminMenuRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const usersRoutes = require("./routes/usersRoutes");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());


// routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/menu", adminMenuRoutes);
app.use("/api/admin", uploadRoutes); // makes endpoint /api/admin/upload-image
app.use("/api/users", usersRoutes);





// simple health check
app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;
