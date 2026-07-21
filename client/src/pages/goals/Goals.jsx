import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import PageLayout from "../../components/layout/PageLayout";
import ErrorState from "../../components/ui/ErrorState";
import { CardSkeleton } from "../../components/ui/Skeleton";

import GoalCard from "../../components/dashboard/GoalCard";

import {
  getGoals,
  updateGoals,
  addManualGoal,
  updateManualGoalProgress,
  deleteManualGoal,
} from "../../api/goals";
import { notifyAchievements } from "../../utils/notifyAchievements";

const POLL_INTERVAL_MS = 60000;

function timeAgo(dateStr) {
  if (!dateStr) return null;

  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function Goals() {
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [daily, setDaily] = useState(3);
  const [weekly, setWeekly] = useState(15);
  const [monthly, setMonthly] = useState(60);

  const [manualLabel, setManualLabel] = useState("");
  const [manualTarget, setManualTarget] = useState(1);
  const [addingManual, setAddingManual] = useState(false);

  const pollRef = useRef(null);

  useEffect(() => {
    loadGoals();

    // Problem-solving progress is computed automatically from linked
    // accounts, so this page keeps itself fresh instead of relying on
    // the user to manually log anything.
    pollRef.current = setInterval(() => {
      loadGoals({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
  }, []);

  async function loadGoals({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setError(false);
    }

    try {
      const { data } = await getGoals();

      setGoals(data);

      setDaily(data.dailyTarget);
      setWeekly(data.weeklyTarget);
      setMonthly(data.monthlyTarget);

      notifyAchievements(data.newAchievements);
    } catch (err) {
      console.log(err);
      if (!silent) {
        setError(true);
        toast.error("Couldn't load your goals");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function saveGoals() {
    try {
      const { data } = await updateGoals({
        dailyTarget: daily,
        weeklyTarget: weekly,
        monthlyTarget: monthly,
      });

      setGoals((prev) => ({ ...prev, ...data }));

      toast.success("Goals updated!");
    } catch (err) {
      console.log(err);
      toast.error("Couldn't update goals");
    }
  }

  async function handleAddManualGoal(e) {
    e.preventDefault();

    if (!manualLabel.trim()) {
      return toast.error("Give this goal a name");
    }

    if (!manualTarget || manualTarget <= 0) {
      return toast.error("Target must be greater than 0");
    }

    try {
      setAddingManual(true);

      const { data } = await addManualGoal({
        label: manualLabel.trim(),
        target: Number(manualTarget),
      });

      setGoals(data);
      setManualLabel("");
      setManualTarget(1);

      toast.success("Manual goal added");
    } catch (err) {
      console.log(err);
      toast.error("Couldn't add goal");
    } finally {
      setAddingManual(false);
    }
  }

  async function handleIncrementManualGoal(id) {
    try {
      const { data } = await updateManualGoalProgress(id, { increment: 1 });

      setGoals(data.goal);
      notifyAchievements(data.newAchievements);
    } catch (err) {
      console.log(err);
      toast.error("Couldn't update progress");
    }
  }

  async function handleDeleteManualGoal(id) {
    try {
      const { data } = await deleteManualGoal(id);

      setGoals(data);
    } catch (err) {
      console.log(err);
      toast.error("Couldn't remove goal");
    }
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <h1 className="text-4xl font-bold dark:text-white">🎯 Goals</h1>

        {goals?.lastSyncedAt && (
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Synced from Codeforces &amp; LeetCode · {timeAgo(goals.lastSyncedAt)}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error || !goals ? (
        <ErrorState
          message="Something went wrong loading your goals."
          onRetry={loadGoals}
        />
      ) : (
        <>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Progress below is calculated automatically from your linked
            Codeforces and LeetCode accounts — nothing to log by hand.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <GoalCard
              title="Daily Goal"
              target={goals.dailyTarget}
              completed={goals.dailyCompleted}
              subtitle="Auto"
            />

            <GoalCard
              title="Weekly Goal"
              target={goals.weeklyTarget}
              completed={goals.weeklyCompleted}
              subtitle="Auto"
            />

            <GoalCard
              title="Monthly Goal"
              target={goals.monthlyTarget}
              completed={goals.monthlyCompleted}
              subtitle="Auto"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mt-10">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              Edit Targets
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <input
                type="number"
                value={daily}
                onChange={(e) => setDaily(Number(e.target.value))}
                className="border rounded-lg p-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Daily Goal"
              />

              <input
                type="number"
                value={weekly}
                onChange={(e) => setWeekly(Number(e.target.value))}
                className="border rounded-lg p-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Weekly Goal"
              />

              <input
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="border rounded-lg p-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Monthly Goal"
              />
            </div>

            <button
              onClick={saveGoals}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Save Targets
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mt-10">
            <h2 className="text-2xl font-bold mb-2 dark:text-white">
              Manual Goals
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              For anything that can't be pulled automatically — revision
              sessions, study hours, mock interviews, whatever you're
              tracking yourself.
            </p>

            {goals.manualGoals?.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {goals.manualGoals.map((g) => (
                  <div
                    key={g._id}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold dark:text-white">{g.label}</span>
                      <button
                        onClick={() => handleDeleteManualGoal(g._id)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex justify-between mb-2 dark:text-gray-200">
                      <span>
                        {g.completed} / {g.target}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(
                            Math.round((g.completed / g.target) * 100),
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <button
                      onClick={() => handleIncrementManualGoal(g._id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      +1
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={handleAddManualGoal}
              className="flex flex-wrap gap-3 items-end"
            >
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Goal name
                </label>
                <input
                  type="text"
                  value={manualLabel}
                  onChange={(e) => setManualLabel(e.target.value)}
                  placeholder="e.g. Revision sessions"
                  className="border rounded-lg p-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Target
                </label>
                <input
                  type="number"
                  min="1"
                  value={manualTarget}
                  onChange={(e) => setManualTarget(Number(e.target.value))}
                  className="border rounded-lg p-3 w-28 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={addingManual}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
              >
                {addingManual ? "Adding..." : "Add Goal"}
              </button>
            </form>
          </div>
        </>
      )}
    </PageLayout>
  );
}

export default Goals;
