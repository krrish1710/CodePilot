const cron = require("node-cron");

const {
  resetDaily,
  resetWeekly,
  resetMonthly,
  runCatchUp,
} = require("../services/goalResetService");

// Schedules the three recurring goal-reset jobs. All run in UTC so
// behavior doesn't depend on the host machine's local timezone.
function start() {
  // Catch up on anything missed while the server was offline (e.g. a
  // deploy or crash spanning midnight) before the regular schedule below
  // takes over.
  runCatchUp().catch((err) =>
    console.error("[goal-reset] startup catch-up failed:", err.message)
  );

  // Every day at 00:00 UTC.
  cron.schedule(
    "0 0 * * *",
    () => {
      resetDaily().catch((err) =>
        console.error("[goal-reset] daily reset failed:", err.message)
      );
    },
    { timezone: "UTC" }
  );

  // Every Monday at 00:00 UTC.
  cron.schedule(
    "0 0 * * 1",
    () => {
      resetWeekly().catch((err) =>
        console.error("[goal-reset] weekly reset failed:", err.message)
      );
    },
    { timezone: "UTC" }
  );

  // The 1st of every month at 00:00 UTC.
  cron.schedule(
    "0 0 1 * *",
    () => {
      resetMonthly().catch((err) =>
        console.error("[goal-reset] monthly reset failed:", err.message)
      );
    },
    { timezone: "UTC" }
  );

  console.log("[goal-reset] daily/weekly/monthly jobs scheduled (UTC)");
}

module.exports = { start };
