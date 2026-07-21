import API from "./axios";

export const getCoachRecommendations = () => {
  return API.get("/coach");
};
