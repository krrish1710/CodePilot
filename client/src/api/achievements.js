import API from "./axios";

export const getAchievements = () => {
  return API.get("/achievements");
};
