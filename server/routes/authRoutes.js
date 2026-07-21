const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  validateRegister,
  validateLogin,
  validatePasswordChange,
} = require("../validators/authValidator");

const {
    register,
    login,
    getProfile,
    updateProfile,
    updateCodeforcesHandle,
    updateLeetCodeUsername,
    updateGithubUsername,
    changePassword,
    deleteAccount,
} = require("../controllers/authController");


// Authentication
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// User Profile
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Save Codeforces Handle
router.put("/codeforces", authMiddleware, updateCodeforcesHandle);

router.put("/leetcode", authMiddleware, updateLeetCodeUsername);

router.put("/github", authMiddleware, updateGithubUsername);

// Settings
router.put(
  "/password",
  authMiddleware,
  validatePasswordChange,
  changePassword
);

router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;
