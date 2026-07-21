import API from "./axios";

export const getCodeforcesUser = (handle) => {
  return API.get(`/codeforces/${handle}`);
};
