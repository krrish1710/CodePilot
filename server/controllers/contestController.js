const SavedContest = require("../models/SavedContest");
const { fetchUpcomingCFContests } = require("../services/contestService");

exports.getUpcomingCFContests = async (req, res) => {
  try {
    const contests = await fetchUpcomingCFContests();
    res.json(contests);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Unable to fetch contests",
    });
  }
};

exports.getSavedContests = async (req, res) => {
  try {
    const saved = await SavedContest.find({ user: req.user.id }).sort({
      startTimeSeconds: 1,
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveContest = async (req, res) => {
  try {
    const { contestId, name, startTimeSeconds, durationSeconds } = req.body;

    if (!contestId || !name || !startTimeSeconds || !durationSeconds) {
      return res.status(400).json({ message: "Missing contest details" });
    }

    // Upsert: saving an already-saved contest just updates its cached
    // details (Codeforces occasionally shifts contest start times)
    // instead of erroring on the unique index.
    const saved = await SavedContest.findOneAndUpdate(
      { user: req.user.id, contestId },
      { name, startTimeSeconds, durationSeconds },
      { upsert: true, returnDocument: "after" }
    );

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unsaveContest = async (req, res) => {
  try {
    await SavedContest.deleteOne({
      user: req.user.id,
      contestId: req.params.contestId,
    });

    res.json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
