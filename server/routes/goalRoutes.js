const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware"); // Use your existing middleware name
const {
  getGoals,
  updateGoals,
  addManualGoal,
  updateManualGoalProgress,
  deleteManualGoal,
} = require("../controllers/goalController");

router.get("/", auth, getGoals);
router.put("/", auth, updateGoals);

// Manual goals (revision sessions, study hours, etc) - the only kind of
// goal progress a user ever enters by hand. Problem-solving progress is
// computed automatically in getGoals and has no manual-entry endpoint.
router.post("/manual", auth, addManualGoal);
router.put("/manual/:id", auth, updateManualGoalProgress);
router.delete("/manual/:id", auth, deleteManualGoal);

module.exports = router;
