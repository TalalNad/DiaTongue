const express = require("express");
const multer = require("multer");
const { requireAuth } = require("../middleware/auth.middleware");
const { runPrediction } = require("../controllers/predict.controller");

const router = express.Router();

// store upload in memory (buffer). simple + fast for local inference calls
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/predict/run
router.post("/run", requireAuth, upload.single("file"), runPrediction);

module.exports = router;