const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    codeforcesHandle: {
      type: String,
      default: "",
    },

    leetcodeUsername: {
      type: String,
      default: "",
    },

    githubUsername: {
      type: String,
      default: "",
    },

    currentStreak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    lastLogin: {
      type: Date,
    },

    xp: {
      type: Number,
      default: 0,
    },

    weeklyStreak: {
      type: Number,
      default: 0,
    },

    monthlyStreak: {
      type: Number,
      default: 0,
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);