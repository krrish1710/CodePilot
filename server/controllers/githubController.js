const axios = require("axios");

exports.getGithubProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const response = await axios.get(
      `https://api.github.com/users/${username}`
    );

    res.json(response.data);
  } catch (err) {
    res.status(404).json({
      message: "GitHub user not found",
    });
  }
};
