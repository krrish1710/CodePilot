import API from "./axios";

export const getAnalytics = () => {
  return API.get("/analytics");
};

export const getAdvancedAnalytics = () => {
  return API.get("/analytics/advanced");
};