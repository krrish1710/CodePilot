const { getAchievementStatus } = require("../services/achievementService");

exports.getAchievements = async (req, res) => {
  try {
    const achievements = await getAchievementStatus(req.user.id);
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
