const axios = require("axios");

exports.getRepositories = async (req, res) => {
  try {
    const username = req.params.username;

    const response = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`
    );

    res.json(response.data);

  } catch (err) {
    res.status(500).json({
      message: "Couldn't fetch repositories",
    });
  }
};