const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { getStreakStatus } = require("../controllers/streakController");

router.get("/", authMiddleware, getStreakStatus);

module.exports = router;
