require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const User = require("./models/User");

async function test() {
  try {
    console.log("Connecting to DB:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected. Creating user...");

    const email = "test" + Date.now() + "@example.com";
    const user = await User.create({
      name: "Test User",
      email: email,
      password: "password123"
    });
    
    console.log("User created:", user);
    fs.writeFileSync("output.log", "Success: " + JSON.stringify(user));
    
    await User.deleteOne({ _id: user._id });
    await mongoose.disconnect();
  } catch (err) {
    console.error("User creation error:", err);
    fs.writeFileSync("error.log", err.toString() + "\n" + err.stack);
  }
}

test();
