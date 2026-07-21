const Notification = require("../models/Notification");

// Single creation path so every notification-generating event (XP
// level-ups, achievement unlocks, and whatever's added later) goes
// through the same shape instead of each caller building its own
// Notification document.
async function createNotification(userId, { type, title, message }) {
  return Notification.create({ user: userId, type, title, message });
}

async function getNotifications(userId, limit = 30) {
  return Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function getUnreadCount(userId) {
  return Notification.countDocuments({ user: userId, read: false });
}

async function markAsRead(userId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { read: true } },
    { returnDocument: "after" }
  );
}

async function markAllAsRead(userId) {
  return Notification.updateMany(
    { user: userId, read: false },
    { $set: { read: true } }
  );
}

async function deleteNotification(userId, notificationId) {
  return Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });
}

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
