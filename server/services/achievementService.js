const User = require("../models/User");
const Goal = require("../models/Goal");
const UserAchievement = require("../models/UserAchievement");
const { calculateLevel } = require("./xpService");
const { createNotification } = require("./notificationService");
const ACHIEVEMENTS = require("./achievementDefinitions");

async function buildContext(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const goal = await Goal.findOne({ user: userId });
  const level = calculateLevel(user.xp).level;

  return { user, goal, level };
}

// Evaluates every achievement definition against the user's current state
// and unlocks (persists) any that are newly met. Safe to call after any
// action that might move the needle (login, linking an account, logging
// goal progress) — already-unlocked achievements are skipped via the
// unique (user, key) index, so this never double-unlocks.
async function checkAndUnlock(userId) {
  const ctx = await buildContext(userId);

  const existing = await UserAchievement.find({ user: userId }).select("key");
  const existingKeys = new Set(existing.map((e) => e.key));

  const newlyUnlocked = [];

  for (const def of ACHIEVEMENTS) {
    if (existingKeys.has(def.key)) continue;

    const { met } = def.evaluate(ctx);

    if (met) {
      await UserAchievement.create({ user: userId, key: def.key });

      await createNotification(userId, {
        type: "achievement",
        title: "Achievement Unlocked",
        message: `${def.icon} ${def.title} — ${def.description}`,
      });

      newlyUnlocked.push({
        key: def.key,
        title: def.title,
        description: def.description,
        icon: def.icon,
      });
    }
  }

  return newlyUnlocked;
}

// Full catalog with per-achievement unlocked/progress status, for the
// achievements page/section.
async function getAchievementStatus(userId) {
  const ctx = await buildContext(userId);

  const unlocked = await UserAchievement.find({ user: userId });
  const unlockedMap = new Map(unlocked.map((u) => [u.key, u.createdAt]));

  return ACHIEVEMENTS.map((def) => {
    const isUnlocked = unlockedMap.has(def.key);
    const { progress } = def.evaluate(ctx);

    return {
      key: def.key,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlocked: isUnlocked,
      unlockedAt: unlockedMap.get(def.key) || null,
      progress: isUnlocked ? 100 : progress,
    };
  });
}

module.exports = { checkAndUnlock, getAchievementStatus };
