const mongoose = require("mongoose");

// One row per problem a user has solved, as detected automatically from
// their linked Codeforces/LeetCode accounts (see
// services/goalProgressService.js). This is the single source of truth
// goal progress is computed from - dailyCompleted/weeklyCompleted/
// monthlyCompleted on Goal are just a cached snapshot derived from
// counting rows here within the relevant UTC window.
//
// The unique (user, source, problemKey) index is what makes repeated
// syncs safe: re-fetching the same Codeforces/LeetCode submission on the
// next sync is a no-op instead of double-counting progress or
// double-awarding XP.
const solvedProblemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    source: {
      type: String,
      enum: ["codeforces", "leetcode"],
      required: true,
    },

    // Codeforces: `${contestId}${index}` (e.g. "1234A"). LeetCode: the
    // problem's titleSlug (e.g. "two-sum"). Only unique within a source,
    // hence the compound index rather than a flat unique key.
    problemKey: {
      type: String,
      required: true,
    },

    solvedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

solvedProblemSchema.index(
  { user: 1, source: 1, problemKey: 1 },
  { unique: true }
);

solvedProblemSchema.index({ user: 1, solvedAt: 1 });

module.exports = mongoose.model("SolvedProblem", solvedProblemSchema);
