const express = require("express");
const router = express.Router();
const {
  createLivestock,
  getAllLivestock,
  getLivestock,
  updateLivestock,
  deleteLivestock,
  getFarmerLivestock,
  analyzeHealthScore,
} = require("../controllers/livestockController");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public
router.get("/", getAllLivestock);

router.get("/:id", getLivestock);

// Analyze endpoint with multer to handle image uploads
router.post(
  "/analyze/:livestockId",
  protect,
  upload.array("images", 10),
  analyzeHealthScore
);

// Farmer only
router.post(
  "/",
  protect,
  requireRole("farmer"),
  upload.array("images", 10),
  createLivestock
);
router.put(
  "/:id",
  protect,
  requireRole("farmer"),
  upload.array("images", 10),
  updateLivestock
);
router.delete("/:id", protect, requireRole("farmer"), deleteLivestock);

// Farmer's own listings
router.get(
  "/farmer/my-listings",
  protect,
  requireRole("farmer"),
  getFarmerLivestock
);

module.exports = router;
