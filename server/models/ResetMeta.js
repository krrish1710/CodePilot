const mongoose = require("mongoose");

// Single-document collection tracking when each recurring goal-reset job
// last actually ran. A cron schedule alone can't tell you it missed a
// run while the server was down (e.g. a deploy or crash spanning
// midnight) - this lets a startup catch-up check detect and run any
// reset that was missed, instead of silently skipping it until the
// next scheduled tick.
const resetMetaSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: "goalReset",
  },

  lastDailyReset: Date,
  lastWeeklyReset: Date,
  lastMonthlyReset: Date,
});

module.exports = mongoose.model("ResetMeta", resetMetaSchema);
