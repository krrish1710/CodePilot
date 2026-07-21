const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { getRecommendations } = require("../controllers/aiCoachController");

router.get("/", authMiddleware, getRecommendations);

module.exports = router;
