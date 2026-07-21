import API from "./axios";

export const getLeetCodeProfile = (username) => {
  return API.get(`/leetcode/${username}`);
};
