const mongoose = require("mongoose");

// One row per user per active day (login or logged goal progress).
// Backs the streak calendar and the weekly/monthly streak calculations -
// a single source of truth instead of separate ad-hoc counters.
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },
});

activitySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Activity", activitySchema);
