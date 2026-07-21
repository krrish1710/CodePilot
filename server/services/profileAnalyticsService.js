const axios = require("axios");
const User = require("../models/User");
const { fetchLeetCodeProfile } = require("./leetcodeService");
const {
  fetchUserInfo: fetchCodeforcesUserInfo,
  fetchRatingHistory: fetchCodeforcesRatingHistory,
} = require("./codeforcesService");

// Live Codeforces/GitHub/LeetCode profile snapshot - extracted out of
// analyticsController so both the Analytics page AND the AI Coach can
// call the exact same logic instead of the Coach re-implementing its own
// copy of these fetches.
async function getProfileAnalytics(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  let codeforces = null;
  let contests = [];
  let github = null;
  let githubRepos = [];
  let leetcode = null;

  // ---------------- Codeforces ----------------

  if (user.codeforcesHandle) {
    try {
      codeforces = await fetchCodeforcesUserInfo(user.codeforcesHandle);
      contests = await fetchCodeforcesRatingHistory(user.codeforcesHandle);
    } catch (err) {
      console.log(err.message);
    }
  }

  // ---------------- GitHub ----------------

  if (user.githubUsername) {
    try {
      const gh = await axios.get(
        `https://api.github.com/users/${user.githubUsername}`
      );

      github = gh.data;

      const repos = await axios.get(
        `https://api.github.com/users/${user.githubUsername}/repos?per_page=100`
      );

      githubRepos = repos.data.sort(
        (a, b) => b.stargazers_count - a.stargazers_count
      );
    } catch (err) {
      console.log(err.message);
    }
  }

  // ---------------- LeetCode ----------------

  if (user.leetcodeUsername) {
    try {
      const lc = await fetchLeetCodeProfile(user.leetcodeUsername);

      const solved = lc.matchedUser?.submitStats?.acSubmissionNum || [];

      const easySolved = solved.find((x) => x.difficulty === "Easy")?.count || 0;
      const mediumSolved = solved.find((x) => x.difficulty === "Medium")?.count || 0;
      const hardSolved = solved.find((x) => x.difficulty === "Hard")?.count || 0;

      leetcode = {
        username: lc.matchedUser?.username,
        totalSolved: easySolved + mediumSolved + hardSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        contestRating: lc.userContestRanking?.rating || null,
      };
    } catch (err) {
      console.log(err.message);
    }
  }

  // ---------- GitHub Language Stats ----------

  const languages = {};

  githubRepos.forEach((repo) => {
    if (!repo.language) return;
    languages[repo.language] = (languages[repo.language] || 0) + 1;
  });

  return { codeforces, contests, github, githubRepos, leetcode, languages };
}

module.exports = { getProfileAnalytics };
