const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getUpcomingCFContests,
  getSavedContests,
  saveContest,
  unsaveContest,
} = require("../controllers/contestController");

router.get("/codeforces", getUpcomingCFContests);

router.get("/saved", authMiddleware, getSavedContests);
router.post("/saved", authMiddleware, saveContest);
router.delete("/saved/:contestId", authMiddleware, unsaveContest);

module.exports = router;
