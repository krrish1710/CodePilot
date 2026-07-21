const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { getAchievements } = require("../controllers/achievementController");

router.get("/", authMiddleware, getAchievements);

module.exports = router;
