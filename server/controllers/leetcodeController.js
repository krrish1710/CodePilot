const { fetchLeetCodeProfile } = require("../services/leetcodeService");

exports.getLeetCodeProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const data = await fetchLeetCodeProfile(username);

    res.json(data);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Unable to fetch LeetCode profile",
    });
  }
};
