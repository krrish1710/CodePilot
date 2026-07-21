import toast from "react-hot-toast";

// Shared by every action that can return `newAchievements` (login, linking
// an account, logging goal progress) so the "you unlocked something" toast
// looks and behaves the same everywhere instead of being re-implemented
// per call site.
export function notifyAchievements(newAchievements) {
  if (!newAchievements?.length) return;

  newAchievements.forEach((a) => {
    toast.success(`${a.icon} Achievement unlocked: ${a.title}`, {
      duration: 5000,
    });
  });
}
