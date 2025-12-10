// backend/routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const { authAdmin } = require("../middleware/authMiddleware");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// configure cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// create multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "foodie_menu",            // optional folder
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

const parser = multer({ storage });

// POST /api/admin/upload-image
// single file field name: "image"
router.post("/upload-image", authAdmin, parser.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    // multer-storage-cloudinary attaches the uploaded file info to req.file
    const imageUrl = req.file.path; // cloudinary url
    return res.status(201).json({ status: "ok", message: "Uploaded", data: { imageUrl } });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ status: "error", message: "Upload failed" });
  }
});

module.exports = router;
