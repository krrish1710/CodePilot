const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.put("/:id/read", authMiddleware, markAsRead);
router.put("/read-all", authMiddleware, markAllAsRead);
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;
