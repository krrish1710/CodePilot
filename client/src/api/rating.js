import API from "./axios";

export const getRatingHistory = (handle) => {
  return API.get(`/codeforces/${handle}/history`);
};
