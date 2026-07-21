const { getAdvancedAnalytics } = require("../services/advancedAnalyticsService");
const { getProfileAnalytics } = require("../services/profileAnalyticsService");

exports.getAnalytics = async (req, res) => {
  try {
    const data = await getProfileAnalytics(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getAdvancedAnalytics = async (req, res) => {
  try {
    const data = await getAdvancedAnalytics(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
