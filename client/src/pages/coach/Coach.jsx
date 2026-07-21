import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw, Brain } from "lucide-react";

import PageLayout from "../../components/layout/PageLayout";
import ErrorState from "../../components/ui/ErrorState";
import { CardSkeleton } from "../../components/ui/Skeleton";
import CoachCard from "../../components/coach/CoachCard";

import { getCoachRecommendations } from "../../api/coach";

const CATEGORY_LABELS = {
  weak_topics: "Weak Areas",
  daily_targets: "Daily Target",
  contest_prep: "Contest Prep",
  consistency: "Consistency",
  xp_optimization: "XP Optimization",
  goal_completion: "Goal Progress",
  motivation: "Motivation",
};

function Coach() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  async function loadRecommendations(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(false);

    try {
      const { data } = await getCoachRecommendations();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.log(err);
      setError(true);
      toast.error("Couldn't load coaching recommendations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadRecommendations();
  }, []);

  // Rules are re-evaluated fresh on every request, sorted so "high"
  // priority items surface first without needing the backend to also
  // handle presentation ordering.
  const priorityRank = { high: 0, medium: 1, low: 2 };
  const sorted = recommendations
    ? [...recommendations].sort(
        (a, b) => priorityRank[a.priority] - priorityRank[b.priority]
      )
    : [];

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold dark:text-white flex items-center gap-3">
          <Brain className="text-purple-600" /> AI Coach
        </h1>

        {!loading && !error && (
          <button
            onClick={() => loadRecommendations(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm bg-white dark:bg-slate-800 border dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          message="Something went wrong generating your coaching recommendations."
          onRetry={() => loadRecommendations()}
        />
      ) : sorted.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-8 text-center text-gray-500 dark:text-gray-400">
          Nothing to flag right now — link a few accounts and log some
          progress, and the coach will have more to work with.
        </div>
      ) : (
        <>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Generated from your Codeforces, LeetCode, GitHub, XP, goals, and
            streak data — rule-based for now, no external AI involved.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {sorted.map((rec) => (
              <CoachCard key={rec.id} recommendation={rec} />
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Categories: {Object.values(CATEGORY_LABELS).join(" · ")}
          </p>
        </>
      )}
    </PageLayout>
  );
}

export default Coach;
