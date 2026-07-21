const express = require("express");
const router = express.Router();

const {
  getGithubProfile,
} = require("../controllers/githubController");

const {
  getRepositories,
} = require("../controllers/githubRepoController");

router.get("/:username", getGithubProfile);

router.get("/:username/repos", getRepositories);

module.exports = router;
