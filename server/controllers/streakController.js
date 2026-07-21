const { computeStreaks } = require("../services/streakService");

exports.getStreakStatus = async (req, res) => {
  try {
    const stats = await computeStreaks(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
