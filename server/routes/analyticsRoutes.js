const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const {
  getAnalytics,
  getAdvancedAnalytics,
} = require("../controllers/analyticsController");

router.get("/", auth, getAnalytics);
router.get("/advanced", auth, getAdvancedAnalytics);

module.exports = router;
