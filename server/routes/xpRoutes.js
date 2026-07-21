const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { getXp } = require("../controllers/xpController");

router.get("/", authMiddleware, getXp);

module.exports = router;
