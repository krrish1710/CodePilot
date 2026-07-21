const { request, gql } = require("graphql-request");

const LEETCODE_API = "https://leetcode.com/graphql";

const PROFILE_QUERY = gql`
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username

      profile {
        ranking
        reputation
        realName
        userAvatar
      }

      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }

    userContestRanking(username: $username) {
      rating
      attendedContestsCount
      globalRanking
      totalParticipants
      topPercentage
    }
  }
`;

// Shared by leetcodeController and analyticsController so both hit the
// LeetCode GraphQL API directly instead of one calling the other over HTTP.
exports.fetchLeetCodeProfile = (username) => {
  return request(LEETCODE_API, PROFILE_QUERY, { username });
};

const RECENT_AC_SUBMISSIONS_QUERY = gql`
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
    }
  }
`;

// Recent *accepted* submissions, each with a unix-seconds timestamp and a
// titleSlug that uniquely identifies the problem. This is what
// goalProgressService reuses to figure out which problems were solved
// today/this week/this month - LeetCode's public API doesn't expose a
// date-ranged "solved between X and Y" endpoint, so this recent-activity
// list is the closest available source. Limited to LeetCode's own cap on
// how much recent history it returns (in practice ~20 entries).
exports.fetchRecentAcSubmissions = (username, limit = 20) => {
  return request(LEETCODE_API, RECENT_AC_SUBMISSIONS_QUERY, {
    username,
    limit,
  });
};
