import API from "./axios";

export const getUpcomingCFContests = () => {
  return API.get("/contests/codeforces");
};

export const getSavedContests = () => {
  return API.get("/contests/saved");
};

export const saveContest = (contest) => {
  return API.post("/contests/saved", contest);
};

export const unsaveContest = (contestId) => {
  return API.delete(`/contests/saved/${contestId}`);
};
