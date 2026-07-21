const { generateRecommendations } = require("../services/aiCoachService");

exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await generateRecommendations(req.user.id);

    res.json({
      recommendations,
      engine: "rule-based",
      generatedAt: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
