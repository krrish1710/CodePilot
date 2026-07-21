const User = require("../models/User");
const Activity = require("../models/Activity");

// Daily/weekly/monthly streak tracking and the activity calendar, backed
// by the Activity collection (one row per user per active day) as the
// single source of truth - replacing the old ad-hoc day-diff counter this
// file started with, rather than running two parallel implementations.

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date) {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Whether the user has not yet been recorded as active today - used to
// gate one-time-per-day rewards (XP) before recordActivity marks today.
async function isNewDayForUser(userId) {
  const today = startOfDay(new Date());
  const existing = await Activity.findOne({ user: userId, date: today });
  return !existing;
}

// Idempotent: marks today as an active day for this user. Safe to call
// more than once per day (unique index prevents duplicates).
async function recordActivity(userId) {
  const today = startOfDay(new Date());

  await Activity.updateOne(
    { user: userId, date: today },
    { $setOnInsert: { user: userId, date: today } },
    { upsert: true }
  );
}

// Pure read: computes current/longest/weekly/monthly streaks and a
// 90-day calendar from the Activity collection, without recording
// anything. Safe to call just to display status.
async function computeStreaks(userId) {
  const activities = await Activity.find({ user: userId }).sort({ date: 1 });
  const dates = activities.map((a) => a.date);
  const dateSet = new Set(dates.map((d) => d.getTime()));

  // Current streak: consecutive days ending today.
  let currentStreak = 0;
  let cursor = startOfDay(new Date());
  while (dateSet.has(cursor.getTime())) {
    currentStreak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  // Longest streak: longest run of consecutive days in the whole history.
  let longestStreak = 0;
  let run = 0;
  let prev = null;
  for (const d of dates) {
    run = prev && d.getTime() - prev.getTime() === DAY_MS ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    prev = d;
  }

  // Weekly streak: consecutive Monday-starting weeks (ending this week)
  // with at least one active day.
  const weekSet = new Set(dates.map((d) => startOfWeek(d).getTime()));
  let weeklyStreak = 0;
  let weekCursor = startOfWeek(new Date());
  while (weekSet.has(weekCursor.getTime())) {
    weeklyStreak++;
    weekCursor = new Date(weekCursor.getTime() - 7 * DAY_MS);
  }

  // Monthly streak: consecutive calendar months (ending this month) with
  // at least one active day.
  const monthSet = new Set(dates.map((d) => startOfMonth(d).getTime()));
  let monthlyStreak = 0;
  let monthCursor = startOfMonth(new Date());
  while (monthSet.has(monthCursor.getTime())) {
    monthlyStreak++;
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1);
  }

  // Last 90 days, oldest first, for a GitHub-style heatmap.
  const calendar = [];
  let day = new Date(startOfDay(new Date()).getTime() - 89 * DAY_MS);
  for (let i = 0; i < 90; i++) {
    calendar.push({
      date: day.toISOString().slice(0, 10),
      active: dateSet.has(day.getTime()),
    });
    day = new Date(day.getTime() + DAY_MS);
  }

  return { currentStreak, longestStreak, weeklyStreak, monthlyStreak, calendar };
}

// Records today's activity and persists the recomputed streak fields onto
// the User document (so profile/dashboard reads don't need to recompute
// from Activity every time). Call this from any action that represents
// real usage - not just login.
async function updateStreakFields(userId) {
  await recordActivity(userId);

  const stats = await computeStreaks(userId);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        currentStreak: stats.currentStreak,
        weeklyStreak: stats.weeklyStreak,
        monthlyStreak: stats.monthlyStreak,
        lastLogin: new Date(),
      },
      // $max only applies if the new value is greater, so a prior
      // longest streak (from before Activity existed) is preserved.
      $max: { longestStreak: stats.longestStreak },
    },
    { new: true }
  );

  return { ...stats, longestStreak: user.longestStreak };
}

module.exports = {
  isNewDayForUser,
  recordActivity,
  computeStreaks,
  updateStreakFields,
};
