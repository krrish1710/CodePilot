import API from "./axios";

export const getStreakStatus = () => {
  return API.get("/streak");
};
