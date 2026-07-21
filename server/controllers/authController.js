const User = require("../models/User");
const Goal = require("../models/Goal");
const XpHistory = require("../models/XpHistory");
const UserAchievement = require("../models/UserAchievement");
const Activity = require("../models/Activity");
const SolvedProblem = require("../models/SolvedProblem");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isNewDayForUser, updateStreakFields } = require("../services/streakService");
const { awardXp } = require("../services/xpService");
const { checkAndUnlock } = require("../services/achievementService");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isNewDay = await isNewDayForUser(user._id);
    const streaks = await updateStreakFields(user._id);

    let xpAward = null;

    if (isNewDay) {
      xpAward = await awardXp(user._id, 10, "Daily login streak");
    }

    const newAchievements = await checkAndUnlock(user._id);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      xp: xpAward,
      newAchievements,
      streaks,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// Codeforces, LeetCode, and GitHub linking were three copies of the same
// "update one field on User, check achievements, respond" logic (and had
// drifted: GitHub used find+mutate+save instead of findByIdAndUpdate, and
// its response was missing `user`). One shared helper, three thin exports.
async function updateLinkedAccountField(req, res, field, message) {
  try {
    const value = req.body.handle ?? req.body.username;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { [field]: value },
      { new: true }
    );

    const newAchievements = await checkAndUnlock(req.user.id);

    res.json({ message, user, newAchievements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateCodeforcesHandle = (req, res) =>
  updateLinkedAccountField(req, res, "codeforcesHandle", "Handle Saved");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            name: user.name,
            email: user.email,

            codeforcesHandle: user.codeforcesHandle,
            leetcodeUsername: user.leetcodeUsername,
            githubUsername: user.githubUsername,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            weeklyStreak: user.weeklyStreak,
            monthlyStreak: user.monthlyStreak,
            lastLogin: user.lastLogin,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.updateLeetCodeUsername = (req, res) =>
  updateLinkedAccountField(req, res, "leetcodeUsername", "LeetCode username saved");

exports.updateGithubUsername = (req, res) =>
  updateLinkedAccountField(req, res, "githubUsername", "GitHub username saved");

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const update = {};

    if (typeof name === "string" && name.trim()) {
      update.name = name.trim();
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
    });

    res.json({
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // Every collection that stores per-user data needs to be cleaned up
    // here, or deleting an account just leaves orphaned XP/achievement/
    // activity records behind under a userId that no longer exists.
    await Promise.all([
      Goal.deleteOne({ user: req.user.id }),
      XpHistory.deleteMany({ user: req.user.id }),
      UserAchievement.deleteMany({ user: req.user.id }),
      Activity.deleteMany({ user: req.user.id }),
      SolvedProblem.deleteMany({ user: req.user.id }),
    ]);

    await User.findByIdAndDelete(req.user.id);

    res.json({
      message: "Account deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};