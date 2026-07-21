const axios = require("axios");

const CF_API = "https://codeforces.com/api";

// Single home for every Codeforces API call. Previously codeforcesController
// and profileAnalyticsService each made their own identical axios calls to
// user.info/user.rating; both now call through here so there's exactly one
// place that knows the Codeforces API's shape, and goalProgressService reuses
// the same module (adding user.status) instead of a third implementation.

async function fetchUserInfo(handle) {
  const response = await axios.get(`${CF_API}/user.info?handles=${handle}`);

  if (response.data.status !== "OK") {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return response.data.result[0];
}

async function fetchRatingHistory(handle) {
  const response = await axios.get(`${CF_API}/user.rating?handle=${handle}`);

  if (response.data.status !== "OK") {
    const err = new Error("Couldn't fetch rating history");
    err.status = 404;
    throw err;
  }

  return response.data.result;
}

// Full submission history (every verdict, not just accepted) - the raw
// material goalProgressService derives "which problems did this user
// solve, and when" from. Codeforces' API doesn't offer a narrower
// "accepted only" or date-ranged endpoint, so we fetch everything once
// per sync and filter/dedupe client-side.
async function fetchUserSubmissions(handle, count = 10000) {
  const response = await axios.get(
    `${CF_API}/user.status?handle=${handle}&from=1&count=${count}`
  );

  if (response.data.status !== "OK") {
    const err = new Error("Couldn't fetch submissions");
    err.status = 404;
    throw err;
  }

  return response.data.result;
}

module.exports = { fetchUserInfo, fetchRatingHistory, fetchUserSubmissions };
