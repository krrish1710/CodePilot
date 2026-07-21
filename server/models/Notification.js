const mongoose = require("mongoose");

// Durable, per-user notifications. XP level-ups and achievement unlocks
// already trigger a toast at the moment they happen, but a toast is
// ephemeral - if the user isn't looking at the screen (or it happened
// during a background goal-progress call), it's gone forever. This
// collection is what backs a real notification history/bell.
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "achievement",
        "level_up",
        "contest_reminder",
        "daily_goal_reminder",
        "weekly_goal_reminder",
        "goal_completed",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
