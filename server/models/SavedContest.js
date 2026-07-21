const mongoose = require("mongoose");

// A user's personal "starred" contests for the Contest Calendar - lets a
// contest stay marked/tracked even after it scrolls out of Codeforces's
// own short upcoming-contests window, and is the actual per-user,
// MongoDB-backed piece of this feature (the contest list itself is
// fetched live from Codeforces, not stored).
const savedContestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contestId: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    startTimeSeconds: {
      type: Number,
      required: true,
    },

    durationSeconds: {
      type: Number,
      required: true,
    },

    // Set once a "starting soon" notification has been sent for this
    // contest, so the reminder job (which runs on a fixed interval)
    // never sends the same reminder twice.
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

savedContestSchema.index({ user: 1, contestId: 1 }, { unique: true });

module.exports = mongoose.model("SavedContest", savedContestSchema);
