// backend/server/index.js
require("dotenv").config();
const app = require("../server");
const connectDB = require("../config/db");

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB(); // connect to MongoDB ONE TIME

  app.listen(PORT, () => {
    console.log(`💡 Backend server running at http://localhost:${PORT}`);
  });
}

startServer();
