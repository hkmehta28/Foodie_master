require("dotenv").config();
const mongoose = require("mongoose");
const MenuItem = require("./models/MenuItem");

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(async () => {
    try {
        const count = await MenuItem.countDocuments();
        console.log("MenuItem count:", count);
        if (count > 0) {
            const items = await MenuItem.find().limit(3);
            console.log("Sample items:", items);
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
});
