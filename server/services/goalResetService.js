const Goal = require("../models/Goal");
const ResetMeta = require("../models/ResetMeta");
const {
  startOfDayUTC,
  startOfIsoWeekUTC,
  startOfMonthUTC,
} = require("../utils/dateWindows");

// Goal completion-counter resets. Deliberately independent of any user
// request (login or otherwise) - these run on a schedule (see
// jobs/goalResetJobs.js) and touch every Goal document at once, so a
// user who never logs back in still gets a clean slate.
//
// dailyCompleted/weeklyCompleted/monthlyCompleted are now derived counts
// re-synced from linked Codeforces/LeetCode accounts (see
// goalProgressService) rather than manually incremented, but this reset
// is still a useful floor: if a sync doesn't happen to run again right
// at the boundary, this guarantees the cached counter doesn't keep
// showing yesterday's/last week's/last month's number until the next
// sync overwrites it. Targets (dailyTarget/weeklyTarget/monthlyTarget),
// manualGoals, and anything on User (xp, streaks, achievements) are
// never written by this service.

async function getMeta() {
  const meta = await ResetMeta.findOneAndUpdate(
    { key: "goalReset" },
    { $setOnInsert: { key: "goalReset" } },
    { upsert: true, returnDocument: "after" }
  );

  return meta;
}

async function resetDaily() {
  const result = await Goal.updateMany({}, { $set: { dailyCompleted: 0 } });

  await ResetMeta.updateOne(
    { key: "goalReset" },
    { $set: { lastDailyReset: new Date() } },
    { upsert: true }
  );

  console.log(
    `[goal-reset] daily reset: ${result.modifiedCount} goal doc(s) updated`
  );
}

async function resetWeekly() {
  const result = await Goal.updateMany({}, { $set: { weeklyCompleted: 0 } });

  await ResetMeta.updateOne(
    { key: "goalReset" },
    { $set: { lastWeeklyReset: new Date() } },
    { upsert: true }
  );

  console.log(
    `[goal-reset] weekly reset: ${result.modifiedCount} goal doc(s) updated`
  );
}

async function resetMonthly() {
  const result = await Goal.updateMany({}, { $set: { monthlyCompleted: 0 } });

  await ResetMeta.updateOne(
    { key: "goalReset" },
    { $set: { lastMonthlyReset: new Date() } },
    { upsert: true }
  );

  console.log(
    `[goal-reset] monthly reset: ${result.modifiedCount} goal doc(s) updated`
  );
}

// Runs once at server startup. If the server was offline when a reset was
// due (e.g. down across midnight), this catches it up immediately instead
// of silently waiting for next scheduled tick - one boundary crossed
// while offline means exactly one catch-up reset, not one per day missed.
async function runCatchUp() {
  const meta = await getMeta();
  const now = new Date();

  if (!meta.lastDailyReset || meta.lastDailyReset < startOfDayUTC(now)) {
    await resetDaily();
  }

  if (
    !meta.lastWeeklyReset ||
    meta.lastWeeklyReset < startOfIsoWeekUTC(now)
  ) {
    await resetWeekly();
  }

  if (
    !meta.lastMonthlyReset ||
    meta.lastMonthlyReset < startOfMonthUTC(now)
  ) {
    await resetMonthly();
  }
}

module.exports = { resetDaily, resetWeekly, resetMonthly, runCatchUp };
