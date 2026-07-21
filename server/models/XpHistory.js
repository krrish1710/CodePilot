const mongoose = require("mongoose");

// One row per XP-earning event, so the frontend can show a real history
// feed instead of just the running total.
const xpHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

xpHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("XpHistory", xpHistorySchema);
