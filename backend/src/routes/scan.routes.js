const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  getMyScans,
  getLatestScan,
  getScanReport,
} = require("../controllers/scan.controller");

const router = express.Router();

// GET /api/scans
router.get("/", requireAuth, getMyScans);

// GET /api/scans/latest
router.get("/latest", requireAuth, getLatestScan);

// ✅ NEW: GET /api/scans/:id/report (download PDF)
router.get("/:id/report", requireAuth, getScanReport);

module.exports = router;