import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import ErrorState from "../ui/ErrorState";
import { CardSkeleton } from "../ui/Skeleton";
import { getUpcomingCFContests } from "../../api/contest";

const REMINDER_WINDOW_SECONDS = 15 * 60; // toast once a contest is within 15 minutes

function UpcomingContests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  // Tracks which contest IDs we've already reminded about, so the toast
  // fires once per contest instead of every second while it's in the
  // reminder window.
  const remindedRef = useRef(new Set());

  async function loadContests() {
    setLoading(true);
    setError(false);

    try {
      const { data } = await getUpcomingCFContests();
      setContests(data);
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  // Contest reminders: fire a one-time toast for any contest starting
  // within REMINDER_WINDOW_SECONDS.
  useEffect(() => {
    for (const contest of contests) {
      const diff = contest.startTimeSeconds - now;

      if (
        diff > 0 &&
        diff <= REMINDER_WINDOW_SECONDS &&
        !remindedRef.current.has(contest.id)
      ) {
        remindedRef.current.add(contest.id);
        toast(`⏰ ${contest.name} starts in under 15 minutes!`, {
          duration: 6000,
        });
      }
    }
  }, [now, contests]);

  function formatDate(seconds) {
    return new Date(seconds * 1000).toLocaleString();
  }

  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${mins}m`;
  }

  function getCountdown(startTimeSeconds) {
    const diff = startTimeSeconds - now;

    if (diff <= 0) return "Started";

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;

    if (days > 0)
      return `${days}d ${hours}h ${mins}m ${secs}s`;

    if (hours > 0)
      return `${hours}h ${mins}m ${secs}s`;

    if (mins > 0)
      return `${mins}m ${secs}s`;

    return `${secs}s`;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Couldn't load upcoming contests."
        onRetry={loadContests}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Upcoming Codeforces Contests
      </h2>

      {contests.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No upcoming contests.
        </p>
      ) : (
        <div className="space-y-4">

          {contests.map((contest) => {
            const startingSoon =
              contest.startTimeSeconds - now > 0 &&
              contest.startTimeSeconds - now <= REMINDER_WINDOW_SECONDS;

            return (
              <div
                key={contest.id}
                className={`border rounded-xl p-6 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                  startingSoon
                    ? "border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                    : "border-gray-200 dark:border-slate-700"
                }`}
              >
                <div>

                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {contest.name}
                  </h3>

                  <span className="inline-block mt-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                    Upcoming Contest
                  </span>

                  <p className="mt-4 text-gray-600 dark:text-gray-300">
                    📅 {formatDate(contest.startTimeSeconds)}
                  </p>

                  <p className="text-gray-600 dark:text-gray-300">
                    ⏱ {formatDuration(contest.durationSeconds)}
                  </p>

                  <p className="mt-2 text-blue-600 dark:text-blue-400 font-bold text-lg">
                    ⏳ {getCountdown(contest.startTimeSeconds)}
                  </p>

                </div>

                <a
                  href={`https://codeforces.com/contest/${contest.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition text-center"
                >
                  Open Contest
                </a>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}

export default UpcomingContests;
