const express = require("express");

const router = express.Router();

const {
  getUserInfo,
  getRatingHistory,
} = require("../controllers/codeforcesController");

router.get("/:handle", getUserInfo);

router.get("/:handle/history", getRatingHistory);

module.exports = router;