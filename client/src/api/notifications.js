import API from "./axios";

export const getNotifications = () => {
  return API.get("/notifications");
};

export const getUnreadCount = () => {
  return API.get("/notifications/unread-count");
};

export const markNotificationAsRead = (id) => {
  return API.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = () => {
  return API.put("/notifications/read-all");
};

export const deleteNotification = (id) => {
  return API.delete(`/notifications/${id}`);
};
