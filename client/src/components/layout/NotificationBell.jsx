import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../api/notifications";

const POLL_INTERVAL_MS = 60000;

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const panelRef = useRef(null);

  async function loadUnreadCount() {
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadNotifications() {
    try {
      const { data } = await getNotifications();
      setNotifications(data);
      setLoaded(true);
    } catch (err) {
      console.log(err);
      toast.error("Couldn't load notifications");
    }
  }

  useEffect(() => {
    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Close the dropdown on an outside click - a DOM event subscription,
  // which is exactly what useEffect is for (as opposed to fetching data
  // in an effect body directly).
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    const next = !open;
    setOpen(next);

    if (next && !loaded) {
      loadNotifications();
    }
  }

  async function handleMarkRead(notification) {
    if (notification.read) return;

    try {
      await markNotificationAsRead(notification._id);

      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.log(err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.log(err);
      toast.error("Couldn't mark notifications as read");
    }
  }

  async function handleDelete(notification, e) {
    e.stopPropagation();

    try {
      await deleteNotification(notification._id);

      setNotifications((prev) => prev.filter((n) => n._id !== notification._id));

      if (!notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.log(err);
      toast.error("Couldn't delete notification");
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        aria-label="Notifications"
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-slate-700">
            <h3 className="font-semibold dark:text-white">Notifications</h3>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No notifications yet.
            </p>
          ) : (
            <div className="divide-y dark:divide-slate-700">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkRead(n)}
                  className={`px-4 py-3 flex gap-2 items-start hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                    !n.read ? "bg-blue-50/50 dark:bg-slate-700/40" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold dark:text-white">
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    {n.read && <Check size={14} className="text-gray-300" />}

                    <button
                      onClick={(e) => handleDelete(n, e)}
                      aria-label="Delete notification"
                      className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
