const cron = require("node-cron");

const {
  checkContestReminders,
  checkDailyGoalReminders,
  checkWeeklyGoalReminders,
} = require("../services/reminderService");

// Schedules the three reminder checks. All run in UTC, same as
// jobs/goalResetJobs.js, so behavior doesn't depend on the host
// machine's local timezone.
function start() {
  // Contest-starting-soon: checked every 15 minutes against a 30-minute
  // window, so nothing gets missed between ticks.
  cron.schedule(
    "*/15 * * * *",
    () => {
      checkContestReminders().catch((err) =>
        console.error("[reminders] contest reminder check failed:", err.message)
      );
    },
    { timezone: "UTC" }
  );

  // Daily goal reminder: once a day, a few hours before the daily reset
  // (00:00 UTC) so there's still time left to act on it.
  cron.schedule(
    "0 20 * * *",
    () => {
      checkDailyGoalReminders().catch((err) =>
        console.error("[reminders] daily goal reminder check failed:", err.message)
      );
    },
    { timezone: "UTC" }
  );

  // Weekly goal reminder: Saturday evening UTC, a day before the Monday
  // weekly reset.
  cron.schedule(
    "0 20 * * 6",
    () => {
      checkWeeklyGoalReminders().catch((err) =>
        console.error("[reminders] weekly goal reminder check failed:", err.message)
      );
    },
    { timezone: "UTC" }
  );

  console.log("[reminders] contest/daily-goal/weekly-goal jobs scheduled (UTC)");
}

module.exports = { start };
