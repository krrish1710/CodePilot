const mongoose = require("mongoose");

// Records which achievements a user has actually unlocked. The catalog of
// possible achievements (title/description/criteria) lives in code
// (services/achievementDefinitions.js), not in the database — this
// collection only stores the unlock events.
const userAchievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    key: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userAchievementSchema.index({ user: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("UserAchievement", userAchievementSchema);
