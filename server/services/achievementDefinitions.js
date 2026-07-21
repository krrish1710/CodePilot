// The catalog of possible achievements and how to evaluate them, kept
// separate from achievementService so the "what counts as unlocked" rules
// are easy to scan and extend in one place.
//
// Each `evaluate(ctx)` receives { user, goal, level } and returns
// { met: boolean, progress: 0-100 }. `progress` is only shown for
// achievements that aren't yet unlocked.

const ACHIEVEMENTS = [
  {
    key: "first_login",
    title: "Getting Started",
    description: "Earn your first XP",
    icon: "🌱",
    evaluate: (ctx) => ({
      met: ctx.user.xp > 0,
      progress: ctx.user.xp > 0 ? 100 : 0,
    }),
  },
  {
    key: "linked_account",
    title: "Account Linked",
    description: "Connect a Codeforces, LeetCode, or GitHub account",
    icon: "🔗",
    evaluate: (ctx) => {
      const linked =
        !!ctx.user.codeforcesHandle ||
        !!ctx.user.leetcodeUsername ||
        !!ctx.user.githubUsername;

      return { met: linked, progress: linked ? 100 : 0 };
    },
  },
  {
    key: "triple_threat",
    title: "Fully Connected",
    description: "Link your Codeforces, LeetCode, and GitHub accounts",
    icon: "🧩",
    evaluate: (ctx) => {
      const count = [
        ctx.user.codeforcesHandle,
        ctx.user.leetcodeUsername,
        ctx.user.githubUsername,
      ].filter(Boolean).length;

      return { met: count === 3, progress: Math.round((count / 3) * 100) };
    },
  },
  {
    key: "streak_7",
    title: "Week Warrior",
    description: "Reach a 7-day login streak",
    icon: "🔥",
    evaluate: (ctx) => ({
      met: ctx.user.currentStreak >= 7,
      progress: Math.min(100, Math.round((ctx.user.currentStreak / 7) * 100)),
    }),
  },
  {
    key: "streak_30",
    title: "Consistency King",
    description: "Reach a 30-day login streak",
    icon: "🏆",
    evaluate: (ctx) => ({
      met: ctx.user.currentStreak >= 30,
      progress: Math.min(
        100,
        Math.round((ctx.user.currentStreak / 30) * 100)
      ),
    }),
  },
  {
    key: "level_5",
    title: "Rising Star",
    description: "Reach Level 5",
    icon: "⭐",
    evaluate: (ctx) => ({
      met: ctx.level >= 5,
      progress: Math.min(100, Math.round((ctx.level / 5) * 100)),
    }),
  },
  {
    key: "level_10",
    title: "Veteran",
    description: "Reach Level 10",
    icon: "💎",
    evaluate: (ctx) => ({
      met: ctx.level >= 10,
      progress: Math.min(100, Math.round((ctx.level / 10) * 100)),
    }),
  },
  {
    key: "goal_crusher",
    title: "Goal Crusher",
    description: "Hit your daily goal target",
    icon: "🎯",
    evaluate: (ctx) => {
      if (!ctx.goal || !ctx.goal.dailyTarget) {
        return { met: false, progress: 0 };
      }

      const progress = Math.min(
        100,
        Math.round((ctx.goal.dailyCompleted / ctx.goal.dailyTarget) * 100)
      );

      return { met: ctx.goal.dailyCompleted >= ctx.goal.dailyTarget, progress };
    },
  },
];

module.exports = ACHIEVEMENTS;
