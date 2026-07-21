const Goal = require("../models/Goal");
const { refreshGoalProgress } = require("../services/goalProgressService");
const { checkAndUnlock } = require("../services/achievementService");
const { updateStreakFields } = require("../services/streakService");

// GET /api/goals — the single source of truth for goal progress.
//
// No manual "I solved a problem" input is accepted anymore: this syncs
// the user's linked Codeforces/LeetCode accounts (via
// goalProgressService, which itself reuses the existing codeforcesService/
// leetcodeService rather than hitting those APIs a second way), persists
// any newly-detected solves, and returns the resulting daily/weekly/
// monthly progress. Called on every Dashboard/Goals page load (and on a
// polling interval on the frontend), so progress reflects reality without
// the user ever telling the app "I solved one."
exports.getGoals = async (req, res) => {
  try {
    const { goal, newlySolvedToday } = await refreshGoalProgress(req.user.id);

    let streaks = null;
    if (newlySolvedToday > 0) {
      streaks = await updateStreakFields(req.user.id);
    }

    // Cheap and idempotent even when nothing new was solved (e.g. a
    // target was lowered since the last check) - unique (user, key)
    // index on UserAchievement means this never double-unlocks.
    const newAchievements = await checkAndUnlock(req.user.id);

    res.json({ ...goal.toObject(), newAchievements, streaks });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.updateGoals = async (req, res) => {
  try {
    const { dailyTarget, weeklyTarget, monthlyTarget } = req.body;

    let goal = await Goal.findOne({ user: req.user.id });

    if (!goal) {
      goal = await Goal.create({ user: req.user.id });
    }

    goal.dailyTarget = dailyTarget;
    goal.weeklyTarget = weeklyTarget;
    goal.monthlyTarget = monthlyTarget;

    await goal.save();

    res.json(goal);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ---------------------------------------------------------------------
// Manual goals - the only kind of goal progress that's still hand-entered,
// reserved for things that genuinely can't be pulled from a linked
// account (revision sessions, study hours, etc). Problem-solving progress
// is never tracked this way anymore.
// ---------------------------------------------------------------------

exports.addManualGoal = async (req, res) => {
  try {
    const { label, target } = req.body;

    if (!label || !String(label).trim()) {
      return res.status(400).json({ message: "Label is required" });
    }

    const numericTarget = Number(target);
    if (!Number.isFinite(numericTarget) || numericTarget <= 0) {
      return res.status(400).json({ message: "Target must be a positive number" });
    }

    let goal = await Goal.findOne({ user: req.user.id });
    if (!goal) {
      goal = await Goal.create({ user: req.user.id });
    }

    goal.manualGoals.push({
      label: String(label).trim(),
      target: numericTarget,
      completed: 0,
    });

    await goal.save();

    res.json(goal);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Body: { completed } (absolute value) or { increment } (relative, e.g.
// "+1 revision session done"). Supporting both keeps a simple "+1" button
// on the frontend possible without a read-modify-write round trip there.
exports.updateManualGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, increment } = req.body;

    const goal = await Goal.findOne({ user: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const manualGoal = goal.manualGoals.id(id);
    if (!manualGoal) {
      return res.status(404).json({ message: "Manual goal not found" });
    }

    if (increment !== undefined) {
      manualGoal.completed = Math.max(0, manualGoal.completed + Number(increment));
    } else if (completed !== undefined) {
      manualGoal.completed = Math.max(0, Number(completed));
    }

    await goal.save();

    const newAchievements = await checkAndUnlock(req.user.id);

    res.json({ goal, newAchievements });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteManualGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({ user: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.manualGoals.id(id)?.deleteOne();

    await goal.save();

    res.json(goal);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
