const { getXpStatus } = require("../services/xpService");

exports.getXp = async (req, res) => {
  try {
    const status = await getXpStatus(req.user.id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
