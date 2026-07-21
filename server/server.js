const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const codeforcesRoutes = require("./routes/codeforcesRoutes");
const leetcodeRoutes = require("./routes/leetcodeRoutes");
const contestRoutes = require("./routes/contestRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const githubRoutes = require("./routes/githubRoutes");
const goalRoutes = require("./routes/goalRoutes");
const xpRoutes = require("./routes/xpRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const streakRoutes = require("./routes/streakRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const aiCoachRoutes = require("./routes/aiCoachRoutes");
const goalResetJobs = require("./jobs/goalResetJobs");
const reminderJobs = require("./jobs/reminderJobs");

const app = express();

// Connect Database
connectDB();

// Scheduled goal-reset jobs (daily/weekly/monthly). Mongoose buffers
// commands by default, so it's safe to schedule these immediately -
// any query issued before the connection is fully open just queues
// until it is.
goalResetJobs.start();
reminderJobs.start();

// Middleware
// Wide-open CORS (no origin restriction) is fine for local development but
// not something a production JWT-auth API should ship with. Restrict to a
// configurable origin, defaulting to Vite's local dev server.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/codeforces", codeforcesRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/xp", xpRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/coach", aiCoachRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 CodePilot Backend Running");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});