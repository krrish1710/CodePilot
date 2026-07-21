import API from "./axios";

export const getGithubProfile = (username) => {
  return API.get(`/github/${username}`);
};

export const getGithubRepos = (username) =>
  API.get(`/github/${username}/repos`);