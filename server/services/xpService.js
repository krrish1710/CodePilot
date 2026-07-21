const User = require("../models/User");
const XpHistory = require("../models/XpHistory");
const { createNotification } = require("./notificationService");

// Cumulative XP required to REACH a given level. Level 1 starts at 0 XP;
// each subsequent level costs 100 more XP than the last (a simple
// triangular curve: 0, 100, 300, 600, 1000, 1500, ...), so leveling up
// gets progressively harder without needing a lookup table.
function cumulativeXpForLevel(level) {
  return (100 * (level - 1) * level) / 2;
}

// Given a total XP amount, returns the user's current level and how far
// through that level they are.
function calculateLevel(xp) {
  const totalXp = Math.max(0, xp || 0);

  let level = 1;
  while (cumulativeXpForLevel(level + 1) <= totalXp) {
    level++;
  }

  const currentLevelXp = cumulativeXpForLevel(level);
  const nextLevelXp = cumulativeXpForLevel(level + 1);

  const xpIntoLevel = totalXp - currentLevelXp;
  const xpForNextLevel = nextLevelXp - currentLevelXp;

  const progressPercent = Math.min(
    100,
    Math.round((xpIntoLevel / xpForNextLevel) * 100)
  );

  return { xp: totalXp, level, xpIntoLevel, xpForNextLevel, progressPercent };
}

// Awards XP to a user, logs it to XpHistory, and reports whether this
// award caused a level-up (so the frontend can celebrate it).
async function awardXp(userId, amount, reason) {
  const before = await User.findById(userId);
  if (!before) throw new Error("User not found");

  const beforeLevel = calculateLevel(before.xp).level;

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { xp: amount } },
    { new: true }
  );

  await XpHistory.create({ user: userId, amount, reason });

  const info = calculateLevel(user.xp);
  const leveledUp = info.level > beforeLevel;

  if (leveledUp) {
    await createNotification(userId, {
      type: "level_up",
      title: "Level Up!",
      message: `You've reached level ${info.level}.`,
    });
  }

  return { ...info, leveledUp };
}

// Full XP status for a user: level/progress plus their recent XP history,
// used by the /api/xp endpoint.
async function getXpStatus(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const info = calculateLevel(user.xp);

  const history = await XpHistory.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(20);

  return { ...info, history };
}

module.exports = { calculateLevel, awardXp, getXpStatus };
