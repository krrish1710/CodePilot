const mongoose = require("mongoose");

// A manually-tracked goal for things that can't be pulled from a linked
// account - e.g. "revision sessions" or "study hours". Unlike the
// daily/weekly/monthly problem-solving targets below (which are now
// computed automatically, see services/goalProgressService.js), these
// are only ever changed by the user directly incrementing `completed`.
const manualGoalSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    target: {
      type: Number,
      required: true,
      min: 1,
    },

    completed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dailyTarget: {
      type: Number,
      default: 3,
    },

    weeklyTarget: {
      type: Number,
      default: 15,
    },

    monthlyTarget: {
      type: Number,
      default: 60,
    },

    // Cached counts, recomputed from the SolvedProblem ledger on every
    // sync (services/goalProgressService.js) rather than manually
    // incremented. Kept as real fields (not computed on every read) so
    // achievementDefinitions/reminderService/the reset jobs can keep
    // reading them directly without each needing to know how to derive
    // them.
    dailyCompleted: {
      type: Number,
      default: 0,
    },

    weeklyCompleted: {
      type: Number,
      default: 0,
    },

    monthlyCompleted: {
      type: Number,
      default: 0,
    },

    // Last time dailyCompleted/weeklyCompleted/monthlyCompleted were
    // refreshed from the linked Codeforces/LeetCode accounts.
    lastSyncedAt: {
      type: Date,
      default: null,
    },

    // Goals that can't be derived from an external account - manually
    // created and manually incremented by the user.
    manualGoals: {
      type: [manualGoalSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);
