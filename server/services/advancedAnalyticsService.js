const XpHistory = require("../models/XpHistory");
const Activity = require("../models/Activity");

// Advanced Analytics is deliberately built from data we already track
// internally (XpHistory, Activity) rather than duplicating the existing
// live-external-API analytics (Codeforces/GitHub/LeetCode profile data,
// already served by GET /api/analytics). This is the "how are you
// trending over time" layer on top of that snapshot.

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Cumulative XP over the last N days, bucketed by day - the raw material
// for an XP growth chart. Days with no XP earned still appear in the
// series (cumulative value carried forward) so the chart doesn't have
// gaps.
async function getXpTrend(userId, days = 30) {
  const since = new Date(startOfDay(new Date()).getTime() - (days - 1) * 86400000);

  const entries = await XpHistory.find({
    user: userId,
    createdAt: { $gte: since },
  }).sort({ createdAt: 1 });

  const earnedByDay = new Map();

  for (const entry of entries) {
    const key = startOfDay(entry.createdAt).toISOString().slice(0, 10);
    earnedByDay.set(key, (earnedByDay.get(key) || 0) + entry.amount);
  }

  // XP earned before the window started still counts toward the running
  // total shown on day one of the chart.
  const priorTotal = await XpHistory.aggregate([
    { $match: { user: userId, createdAt: { $lt: since } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  let cumulative = priorTotal[0]?.total || 0;
  const trend = [];

  for (let i = 0; i < days; i++) {
    const day = new Date(since.getTime() + i * 86400000);
    const key = day.toISOString().slice(0, 10);
    const earned = earnedByDay.get(key) || 0;

    cumulative += earned;
    trend.push({ date: key, earned, cumulativeXp: cumulative });
  }

  return trend;
}

// Problems logged per ISO week, over the last N weeks - a productivity
// trend distinct from the daily streak (a week can have a broken streak
// but still show a solid problem count, or vice versa).
async function getProductivityTrend(userId, weeks = 8) {
  const since = new Date(
    startOfDay(new Date()).getTime() - weeks * 7 * 86400000
  );

  const entries = await XpHistory.find({
    user: userId,
    reason: "Logged a problem solved",
    createdAt: { $gte: since },
  });

  function startOfIsoWeek(date) {
    const d = startOfDay(date);
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diffToMonday);
    return d;
  }

  const countByWeek = new Map();

  for (const entry of entries) {
    const key = startOfIsoWeek(entry.createdAt).toISOString().slice(0, 10);
    countByWeek.set(key, (countByWeek.get(key) || 0) + 1);
  }

  const trend = [];
  const firstWeek = startOfIsoWeek(since);

  for (let i = 0; i <= weeks; i++) {
    const weekStart = new Date(firstWeek.getTime() + i * 7 * 86400000);
    const key = weekStart.toISOString().slice(0, 10);

    trend.push({
      weekStart: key,
      problemsSolved: countByWeek.get(key) || 0,
    });
  }

  return trend;
}

// Which days of the week the user is actually active on, all-time -
// answers "am I a weekend grinder or a weekday-only person", which
// neither the streak calendar nor the existing analytics page shows.
async function getWeekdayBreakdown(userId) {
  const activities = await Activity.find({ user: userId });

  const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun

  for (const a of activities) {
    const day = a.date.getDay(); // 0 = Sunday
    const index = day === 0 ? 6 : day - 1; // shift to Mon=0..Sun=6
    counts[index]++;
  }

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return labels.map((label, i) => ({ day: label, count: counts[i] }));
}

async function getAdvancedAnalytics(userId) {
  const [xpTrend, productivityTrend, weekdayBreakdown] = await Promise.all([
    getXpTrend(userId),
    getProductivityTrend(userId),
    getWeekdayBreakdown(userId),
  ]);

  return { xpTrend, productivityTrend, weekdayBreakdown };
}

module.exports = {
  getXpTrend,
  getProductivityTrend,
  getWeekdayBreakdown,
  getAdvancedAnalytics,
};
