const express = require("express");

const router = express.Router();

const {
  getLeetCodeProfile,
} = require("../controllers/leetcodeController");

router.get("/:username", getLeetCodeProfile);

module.exports = router;