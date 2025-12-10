const bcrypt = require("bcryptjs");

async function test() {
  try {
    console.log("Testing bcryptjs...");
    const salt = await bcrypt.genSalt(10);
    console.log("Salt generated:", salt);
    const hash = await bcrypt.hash("password123", salt);
    console.log("Hash generated:", hash);
    const match = await bcrypt.compare("password123", hash);
    console.log("Match:", match);
  } catch (err) {
    console.error("Bcryptjs error:", err);
  }
}

test();
