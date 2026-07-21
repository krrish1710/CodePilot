import API from "./axios";

export const getXpStatus = () => {
  return API.get("/xp");
};
