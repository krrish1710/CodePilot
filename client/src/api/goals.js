import API from "./axios";

export const getGoals = () => {
  return API.get("/goals");
};

export const updateGoals = (data) => {
  return API.put("/goals", data);
};

// Manual goals — the only kind of goal a user still enters progress for
// by hand (e.g. revision sessions, study hours). Problem-solving goals
// are computed automatically server-side; getGoals() above already
// returns up-to-date daily/weekly/monthly progress with no action needed.
export const addManualGoal = (data) => {
  return API.post("/goals/manual", data);
};

export const updateManualGoalProgress = (id, data) => {
  return API.put(`/goals/manual/${id}`, data);
};

export const deleteManualGoal = (id) => {
  return API.delete(`/goals/manual/${id}`);
};
