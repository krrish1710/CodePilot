import API from "./axios";


export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

export const saveCodeforcesHandle = (handle) => {
  return API.put("/auth/codeforces", { handle });
};

export const saveLeetCodeUsername = (username) => {
  return API.put("/auth/leetcode", { username });
};

export const getProfile = () => {
  return API.get("/auth/profile");
};

export const saveGithubUsername = (username) => {
  return API.put("/auth/github", { username });
};

export const updateProfileName = (name) => {
  return API.put("/auth/profile", { name });
};

export const changePassword = (currentPassword, newPassword) => {
  return API.put("/auth/password", { currentPassword, newPassword });
};

export const deleteAccount = () => {
  return API.delete("/auth/account");
};