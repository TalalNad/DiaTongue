const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { getMe, updateMe } = require("../controllers/user.controller");

const router = express.Router();

// GET /api/users/me
router.get("/me", requireAuth, getMe);

// PUT /api/users/me
router.put("/me", requireAuth, updateMe);

module.exports = router;