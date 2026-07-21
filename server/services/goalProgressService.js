const User = require("../models/User");
const Goal = require("../models/Goal");
const SolvedProblem = require("../models/SolvedProblem");
const { fetchUserSubmissions } = require("./codeforcesService");
const { fetchRecentAcSubmissions } = require("./leetcodeService");
const { awardXp } = require("./xpService");
const { recordActivity } = require("./streakService");
const { createNotification } = require("./notificationService");
const {
  startOfDayUTC,
  startOfIsoWeekUTC,
  startOfMonthUTC,
} = require("../utils/dateWindows");

// Same reason string the old manual "I solved a problem" button used
// (services/goalController.logProgress, now removed) - advancedAnalyticsService's
// productivity trend filters XpHistory by this exact string, and there's
// no reason to fork it into a source-specific string that chart would
// silently stop matching.
const SOLVE_XP_REASON = "Logged a problem solved";
const XP_PER_PROBLEM = 5;

// ---------------------------------------------------------------------
// Per-source fetch + normalize. Each of these makes exactly ONE call to
// the shared codeforcesService/leetcodeService per sync - no duplicate
// API calls, and no re-implementation of the Codeforces/LeetCode fetch
// logic that already lives in those services.
// ---------------------------------------------------------------------

// Codeforces' user.status returns every submission (all verdicts, every
// attempt). We only care about accepted ones, deduped down to the
// earliest acceptance per problem (resubmitting an already-solved
// problem shouldn't count again).
async function getCodeforcesSolves(handle) {
  if (!handle) return [];

  let submissions;
  try {
    submissions = await fetchUserSubmissions(handle);
  } catch (err) {
    console.log("[goal-progress] Codeforces fetch failed:", err.message);
    return [];
  }

  const earliestByProblem = new Map();

  for (const sub of submissions) {
    if (sub.verdict !== "OK") continue;

    const key = `${sub.problem.contestId ?? "gym"}${sub.problem.index}`;
    const solvedAt = new Date(sub.creationTimeSeconds * 1000);

    const existing = earliestByProblem.get(key);
    if (!existing || solvedAt < existing) {
      earliestByProblem.set(key, solvedAt);
    }
  }

  return Array.from(earliestByProblem, ([problemKey, solvedAt]) => ({
    source: "codeforces",
    problemKey,
    solvedAt,
  }));
}

// LeetCode's recentAcSubmissionList is accepted-only already, but can
// still contain more than one entry for the same problem (resubmits) -
// dedupe the same way as Codeforces above, to the earliest timestamp.
async function getLeetCodeSolves(username) {
  if (!username) return [];

  let data;
  try {
    data = await fetchRecentAcSubmissions(username, 20);
  } catch (err) {
    console.log("[goal-progress] LeetCode fetch failed:", err.message);
    return [];
  }

  const submissions = data?.recentAcSubmissionList || [];
  const earliestByProblem = new Map();

  for (const sub of submissions) {
    const solvedAt = new Date(Number(sub.timestamp) * 1000);
    const existing = earliestByProblem.get(sub.titleSlug);
    if (!existing || solvedAt < existing) {
      earliestByProblem.set(sub.titleSlug, solvedAt);
    }
  }

  return Array.from(earliestByProblem, ([problemKey, solvedAt]) => ({
    source: "leetcode",
    problemKey,
    solvedAt,
  }));
}

// Pulls the latest solve data from both linked accounts and persists any
// problem not already in the SolvedProblem ledger. Idempotent: re-running
// this against the same underlying submissions is a no-op the second
// time, thanks to the unique (user, source, problemKey) index.
async function syncSolvedProblems(userId, user) {
  const [cfSolves, lcSolves] = await Promise.all([
    getCodeforcesSolves(user.codeforcesHandle),
    getLeetCodeSolves(user.leetcodeUsername),
  ]);

  const allSolves = [...cfSolves, ...lcSolves];
  if (allSolves.length === 0) return [];

  const existing = await SolvedProblem.find({
    user: userId,
    problemKey: { $in: allSolves.map((s) => s.problemKey) },
  }).select("source problemKey");

  const existingKeys = new Set(
    existing.map((e) => `${e.source}:${e.problemKey}`)
  );

  const newSolves = allSolves.filter(
    (s) => !existingKeys.has(`${s.source}:${s.problemKey}`)
  );

  if (newSolves.length > 0) {
    try {
      await SolvedProblem.insertMany(
        newSolves.map((s) => ({ user: userId, ...s })),
        { ordered: false }
      );
    } catch (err) {
      // A second concurrent sync (e.g. two tabs open) can race on the
      // unique index between the check above and this insert - a
      // duplicate-key error here just means the other request already
      // recorded it, which is fine to ignore.
      if (err.code !== 11000) throw err;
    }
  }

  return newSolves;
}

function countSince(solvedDates, since) {
  let count = 0;
  for (const d of solvedDates) {
    if (d >= since) count++;
  }
  return count;
}

// Full refresh for one user: sync newly-solved problems from their linked
// accounts, award XP/streak credit for the ones solved today (see note
// below), and recompute+persist dailyCompleted/weeklyCompleted/
// monthlyCompleted onto the Goal doc from the SolvedProblem ledger.
//
// XP/streak credit is only granted for solves that happened *today*
// (solvedAt >= start of today), not for every newly-inserted row. The
// very first sync for a user with years of Codeforces history would
// otherwise "discover" thousands of historical solves at once and hand
// out a matching pile of retroactive XP. Older solves still get recorded
// in the ledger (so this week's/this month's counts are accurate), just
// without XP/streak side effects.
async function refreshGoalProgress(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const now = new Date();
  const dayStart = startOfDayUTC(now);
  const weekStart = startOfIsoWeekUTC(now);
  const monthStart = startOfMonthUTC(now);

  const newSolves = await syncSolvedProblems(userId, user);
  const solvedToday = newSolves.filter((s) => s.solvedAt >= dayStart);

  let xp = null;
  if (solvedToday.length > 0) {
    await recordActivity(userId);

    for (const _solve of solvedToday) {
      xp = await awardXp(userId, XP_PER_PROBLEM, SOLVE_XP_REASON);
    }
  }

  const allSolved = await SolvedProblem.find({ user: userId }).select(
    "solvedAt"
  );
  const solvedDates = allSolved.map((s) => s.solvedAt);

  let goal = await Goal.findOne({ user: userId });
  if (!goal) goal = new Goal({ user: userId });

  // Capture "was already complete" before mutating, so the notification
  // only fires on the crossing - not on every subsequent sync after the
  // target's already been hit for the period.
  const wasDailyComplete =
    goal.dailyTarget > 0 && goal.dailyCompleted >= goal.dailyTarget;
  const wasWeeklyComplete =
    goal.weeklyTarget > 0 && goal.weeklyCompleted >= goal.weeklyTarget;
  const wasMonthlyComplete =
    goal.monthlyTarget > 0 && goal.monthlyCompleted >= goal.monthlyTarget;

  goal.dailyCompleted = countSince(solvedDates, dayStart);
  goal.weeklyCompleted = countSince(solvedDates, weekStart);
  goal.monthlyCompleted = countSince(solvedDates, monthStart);
  goal.lastSyncedAt = now;

  await goal.save();

  if (!wasDailyComplete && goal.dailyTarget > 0 && goal.dailyCompleted >= goal.dailyTarget) {
    await createNotification(userId, {
      type: "goal_completed",
      title: "Daily goal completed!",
      message: `You hit your daily target of ${goal.dailyTarget} problems.`,
    });
  }

  if (!wasWeeklyComplete && goal.weeklyTarget > 0 && goal.weeklyCompleted >= goal.weeklyTarget) {
    await createNotification(userId, {
      type: "goal_completed",
      title: "Weekly goal completed!",
      message: `You hit your weekly target of ${goal.weeklyTarget} problems.`,
    });
  }

  if (!wasMonthlyComplete && goal.monthlyTarget > 0 && goal.monthlyCompleted >= goal.monthlyTarget) {
    await createNotification(userId, {
      type: "goal_completed",
      title: "Monthly goal completed!",
      message: `You hit your monthly target of ${goal.monthlyTarget} problems.`,
    });
  }

  return {
    goal,
    xp,
    newlySolvedTotal: newSolves.length,
    newlySolvedToday: solvedToday.length,
  };
}

module.exports = {
  refreshGoalProgress,
  syncSolvedProblems,
  SOLVE_XP_REASON,
};
