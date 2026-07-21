const axios = require("axios");

// Extracted out of contestController so any other consumer (the
// reminder job, in particular) can reuse the exact same fetch/filter
// logic instead of duplicating it.
async function fetchUpcomingCFContests() {
  const response = await axios.get("https://codeforces.com/api/contest.list");

  return response.data.result
    .filter((contest) => contest.phase === "BEFORE")
    // A calendar view wants a fuller picture than a short dashboard
    // list - Codeforces rarely schedules more than ~30 contests out,
    // so this isn't really a cap in practice, just a sane ceiling.
    .slice(0, 30);
}

module.exports = { fetchUpcomingCFContests };
