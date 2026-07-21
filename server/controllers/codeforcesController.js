const {
  fetchUserInfo,
  fetchRatingHistory,
} = require("../services/codeforcesService");

exports.getUserInfo = async (req, res) => {
  try {
    const { handle } = req.params;

    const result = await fetchUserInfo(handle);

    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message:
        error.status === 404 ? "User not found" : "Failed to fetch Codeforces data",
    });
  }
};

exports.getRatingHistory = async (req, res) => {
  try {
    const { handle } = req.params;

    const result = await fetchRatingHistory(handle);

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.status === 404 ? "User not found" : "Couldn't fetch rating history",
    });
  }
};
