const User = require("../models/User");
const Goal = require("../models/Goal");
const { getProfileAnalytics } = require("./profileAnalyticsService");
const { computeStreaks } = require("./streakService");
const { getXpStatus } = require("./xpService");
const { getAdvancedAnalytics } = require("./advancedAnalyticsService");

// ============================================================================
// AI Coding Coach
//
// This is deliberately split into two stages:
//
//   1. gatherCoachingContext(userId) - pulls together everything the coach
//      needs by reusing existing services (no analytics logic is
//      duplicated here; every data source below already exists elsewhere
//      in the app).
//
//   2. generateRecommendations(userId) - turns that context into a list
//      of recommendations, currently via a small set of pure rule
//      functions (RULES below).
//
// This split is the seam for plugging in a real LLM later: a future
// version of this file would keep gatherCoachingContext exactly as-is,
// build a prompt from its output instead of running RULES, and parse the
// model's response into the same { id, category, title, message,
// priority } shape. The controller, routes, and frontend never need to
// know which engine produced a recommendation - only this file changes.
// ============================================================================

async function gatherCoachingContext(userId) {
  const [user, goal, profile, streaks, xp, advanced] = await Promise.all([
    User.findById(userId),
    Goal.findOne({ user: userId }),
    getProfileAnalytics(userId),
    computeStreaks(userId),
    getXpStatus(userId),
    getAdvancedAnalytics(userId),
  ]);

  if (!user) throw new Error("User not found");

  return { user, goal, profile, streaks, xp, advanced };
}

function rec(id, category, title, message, priority = "medium") {
  return { id, category, title, message, priority };
}

// ---------------------------------------------------------------------------
// Rule modules. Each takes the shared context and returns zero, one, or
// several recommendations. Kept as small, independent, pure functions so
// each rule can be reasoned about (and tested) on its own.
// ---------------------------------------------------------------------------

// Weak areas: this app doesn't track per-topic problem tags, so "weak
// topics" is grounded in signals we actually have - difficulty
// distribution and contest participation - rather than fabricating
// topic-level data that doesn't exist.
function ruleWeakAreas(ctx) {
  const out = [];
  const { leetcode } = ctx.profile;

  if (leetcode && leetcode.totalSolved > 0) {
    const hardRatio = leetcode.hardSolved / leetcode.totalSolved;

    if (hardRatio < 0.1 && leetcode.totalSolved >= 20) {
      out.push(
        rec(
          "weak_hard_problems",
          "weak_topics",
          "Push into Hard problems",
          `Only ${Math.round(hardRatio * 100)}% of your solved LeetCode problems are Hard (${leetcode.hardSolved}/${leetcode.totalSolved}). Deliberately picking a Hard problem once or twice a week builds the skills Easy/Medium practice plateaus on.`,
          "medium"
        )
      );
    }
  }

  if (ctx.profile.codeforces && ctx.profile.contests.length < 3) {
    out.push(
      rec(
        "weak_contest_reps",
        "weak_topics",
        "Get more contest reps in",
        `You've only got ${ctx.profile.contests.length} rated Codeforces contest(s) on record. Rating (and the pattern-recognition it reflects) improves fastest with regular contest participation, not just practice problems.`,
        "medium"
      )
    );
  }

  return out;
}

// Suggested daily target, based on actual recent throughput rather than
// whatever number the user happened to type into Goals originally.
function ruleSuggestedDailyTarget(ctx) {
  const trend = ctx.advanced.productivityTrend || [];
  const totalSolved = trend.reduce((sum, w) => sum + w.problemsSolved, 0);
  const weeksWithData = trend.length || 1;

  const avgPerWeek = totalSolved / weeksWithData;
  const suggested = Math.max(1, Math.round(avgPerWeek / 7));

  const currentTarget = ctx.goal?.dailyTarget;

  if (!currentTarget) return [];

  if (Math.abs(suggested - currentTarget) >= 1) {
    const direction = suggested > currentTarget ? "raising" : "lowering";

    return [
      rec(
        "suggested_daily_target",
        "daily_targets",
        "Your daily target may be off pace",
        `Based on your last ${weeksWithData} week(s), you're averaging about ${avgPerWeek.toFixed(1)} problems/week (~${suggested}/day). Your current daily target is ${currentTarget}. Consider ${direction} it to ${suggested} to match your actual pace.`,
        "low"
      ),
    ];
  }

  return [];
}

// Contest preparation advice, from the Codeforces rating trend.
function ruleContestPrep(ctx) {
  const { contests } = ctx.profile;

  if (!contests || contests.length === 0) {
    return [
      rec(
        "no_contest_history",
        "contest_prep",
        "Link Codeforces and enter a contest",
        "You don't have any rated Codeforces contests linked yet. Div 3/Div 4 contests are the best low-pressure entry point if you haven't rated in a while.",
        "low"
      ),
    ];
  }

  const recent = contests.slice(-3);
  const trendingDown =
    recent.length >= 2 &&
    recent[recent.length - 1].newRating < recent[0].newRating;

  if (trendingDown) {
    return [
      rec(
        "rating_trending_down",
        "contest_prep",
        "Rating's dipped over your last few contests",
        "Your rating has trended down across your last few rated contests. That's normal, but before your next one, spend a session doing untimed upsolving on problems you didn't finish - it tends to help more than more contests back-to-back.",
        "high"
      ),
    ];
  }

  return [];
}

// Consistency: how the current streak compares to the user's own best,
// and whether it's actively broken right now.
function ruleConsistencyWarning(ctx) {
  const { currentStreak, longestStreak } = ctx.streaks;

  if (currentStreak === 0 && longestStreak > 0) {
    return [
      rec(
        "streak_broken",
        "consistency",
        "Your streak reset",
        `Your streak is back to 0, down from a best of ${longestStreak} days. One rough day doesn't undo the habit - the fastest way back is today, not "starting over Monday."`,
        "high"
      ),
    ];
  }

  if (currentStreak > 0 && longestStreak > 0 && currentStreak < longestStreak * 0.3) {
    return [
      rec(
        "streak_below_best",
        "consistency",
        "Well below your personal best streak",
        `You're at a ${currentStreak}-day streak, compared to a best of ${longestStreak}. No action needed - just flagging it, since a lot of people don't realize how much their pace has dropped.`,
        "low"
      ),
    ];
  }

  return [];
}

// XP optimization: is most XP coming from the passive daily-login bonus,
// or from actually logging solved problems (which also feeds
// achievements and the productivity trend)?
function ruleXpOptimization(ctx) {
  const history = ctx.xp.history || [];
  if (history.length === 0) return [];

  const loginXp = history
    .filter((h) => h.reason === "Daily login streak")
    .reduce((sum, h) => sum + h.amount, 0);

  const problemXp = history
    .filter((h) => h.reason === "Logged a problem solved")
    .reduce((sum, h) => sum + h.amount, 0);

  const total = loginXp + problemXp;
  if (total === 0) return [];

  if (loginXp / total > 0.7) {
    return [
      rec(
        "xp_mostly_passive",
        "xp_optimization",
        "Most of your recent XP is just from logging in",
        "Logging a solved problem earns XP too, and also counts toward goal progress and several achievements at once. Logging in alone caps out fast.",
        "medium"
      ),
    ];
  }

  return [];
}

// Goal completion advice: which of the three targets (if any) is behind
// pace right now.
function ruleGoalCompletion(ctx) {
  const goal = ctx.goal;
  if (!goal) return [];

  const out = [];

  const behindDaily = goal.dailyTarget > 0 && goal.dailyCompleted < goal.dailyTarget;
  const behindWeekly = goal.weeklyTarget > 0 && goal.weeklyCompleted < goal.weeklyTarget;

  if (behindDaily && behindWeekly) {
    out.push(
      rec(
        "behind_on_goals",
        "goal_completion",
        "Behind on both daily and weekly goals",
        `${goal.dailyCompleted}/${goal.dailyTarget} today, ${goal.weeklyCompleted}/${goal.weeklyTarget} this week. One logged problem right now closes both gaps at once.`,
        "medium"
      )
    );
  } else if (behindDaily) {
    out.push(
      rec(
        "behind_on_daily",
        "goal_completion",
        "Daily goal not yet hit",
        `${goal.dailyCompleted}/${goal.dailyTarget} problems logged today.`,
        "low"
      )
    );
  }

  return out;
}

// Motivational insight - always returns something, so the coach never
// shows an empty/discouraging list.
function ruleMotivation(ctx) {
  const { level } = ctx.xp;
  const { longestStreak } = ctx.streaks;

  if (longestStreak >= 7) {
    return [
      rec(
        "motivation_streak",
        "motivation",
        "Your consistency is showing",
        `A ${longestStreak}-day streak at your best puts you ahead of most people who start this kind of habit. Momentum compounds - keep stacking days.`,
        "low"
      ),
    ];
  }

  return [
    rec(
      "motivation_general",
      "motivation",
      `Level ${level} and climbing`,
      "Every problem logged and every contest entered is compounding, even on days it doesn't feel like it. Small, regular reps beat occasional heroics.",
      "low"
    ),
  ];
}

const RULES = [
  ruleWeakAreas,
  ruleSuggestedDailyTarget,
  ruleContestPrep,
  ruleConsistencyWarning,
  ruleXpOptimization,
  ruleGoalCompletion,
  ruleMotivation,
];

async function generateRecommendations(userId) {
  const ctx = await gatherCoachingContext(userId);

  return RULES.flatMap((rule) => rule(ctx) || []);
}

module.exports = { generateRecommendations, gatherCoachingContext };
