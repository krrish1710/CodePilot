import { Star } from "lucide-react";

// A single contest row shown in the Contest Calendar's day-detail list.
// Distinct from dashboard/UpcomingContests's card - this one adds the
// save/star toggle and doesn't own its own countdown ticker (the
// calendar page ticks `now` once for the whole list instead of each
// card running its own interval).
function ContestDayCard({ contest, now, saved, onToggleSave }) {
  const diff = contest.startTimeSeconds - now;

  function formatCountdown() {
    if (diff <= 0) return "Started";

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  function formatDuration() {
    const hours = Math.floor(contest.durationSeconds / 3600);
    const mins = Math.floor((contest.durationSeconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
      <div>
        <h4 className="font-semibold dark:text-white">{contest.name}</h4>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {/* toLocaleString() with no timeZone option uses the browser's
              local timezone automatically. */}
          {new Date(contest.startTimeSeconds * 1000).toLocaleString()}{" "}
          <span className="text-xs">(your local time)</span>
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Duration: {formatDuration()}
        </p>

        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-1">
          ⏳ {formatCountdown()}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSave}
          title={saved ? "Remove from saved" : "Save this contest"}
          className={`p-2 rounded-lg transition-colors ${
            saved
              ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-slate-700"
              : "text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          <Star size={20} fill={saved ? "currentColor" : "none"} />
        </button>

        <a
          href={`https://codeforces.com/contest/${contest.id}`}
          target="_blank"
          rel="noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Open
        </a>
      </div>
    </div>
  );
}

export default ContestDayCard;
