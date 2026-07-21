const Goal = require("../models/Goal");
const SavedContest = require("../models/SavedContest");
const { createNotification } = require("./notificationService");
const { refreshGoalProgress } = require("./goalProgressService");

const REMINDER_WINDOW_SECONDS = 30 * 60; // 30 minutes

// Contest-starting-soon reminders are tied to SavedContest (contests the
// user explicitly starred on the Contest Calendar) rather than every
// contest for every user - sending a notification for every Codeforces
// contest to everyone regardless of interest would be spam, and this
// reuses data the Contest Calendar feature already persists instead of
// tracking per-user contest interest a second way.
async function checkContestReminders() {
  const now = Math.floor(Date.now() / 1000);

  const due = await SavedContest.find({
    reminderSent: false,
    startTimeSeconds: { $gt: now, $lte: now + REMINDER_WINDOW_SECONDS },
  });

  for (const contest of due) {
    await createNotification(contest.user, {
      type: "contest_reminder",
      title: "Contest starting soon",
      message: `${contest.name} starts in under 30 minutes.`,
    });

    contest.reminderSent = true;
    await contest.save();
  }

  return due.length;
}

// Daily goal reminders: runs once a day (see jobs/reminderJobs.js), so
// there's no need to dedupe within a day - one scheduled run naturally
// means at most one reminder per user per day.
//
// dailyCompleted is a cache written by goalProgressService whenever a
// user's Dashboard/Goals page syncs - a user who hasn't opened the app
// today would otherwise be evaluated against a stale number here, so
// each candidate is re-synced (reusing goalProgressService, not a
// second Codeforces/LeetCode fetch implementation) before the threshold
// check.
async function checkDailyGoalReminders() {
  const candidates = await Goal.find({ dailyTarget: { $gt: 0 } }).select(
    "user"
  );

  let sent = 0;

  for (const candidate of candidates) {
    let goal;
    try {
      ({ goal } = await refreshGoalProgress(candidate.user));
    } catch (err) {
      console.log("[reminders] goal sync failed:", err.message);
      continue;
    }

    if (goal.dailyCompleted < goal.dailyTarget) {
      await createNotification(goal.user, {
        type: "daily_goal_reminder",
        title: "Daily goal reminder",
        message: `You're at ${goal.dailyCompleted}/${goal.dailyTarget} problems today - still time to close the gap.`,
      });
      sent++;
    }
  }

  return sent;
}

// Weekly goal reminders: runs once a week (see jobs/reminderJobs.js).
// Same sync-before-check reasoning as checkDailyGoalReminders above.
async function checkWeeklyGoalReminders() {
  const candidates = await Goal.find({ weeklyTarget: { $gt: 0 } }).select(
    "user"
  );

  let sent = 0;

  for (const candidate of candidates) {
    let goal;
    try {
      ({ goal } = await refreshGoalProgress(candidate.user));
    } catch (err) {
      console.log("[reminders] goal sync failed:", err.message);
      continue;
    }

    if (goal.weeklyCompleted < goal.weeklyTarget) {
      await createNotification(goal.user, {
        type: "weekly_goal_reminder",
        title: "Weekly goal reminder",
        message: `You're at ${goal.weeklyCompleted}/${goal.weeklyTarget} problems this week.`,
      });
      sent++;
    }
  }

  return sent;
}

module.exports = {
  checkContestReminders,
  checkDailyGoalReminders,
  checkWeeklyGoalReminders,
};
