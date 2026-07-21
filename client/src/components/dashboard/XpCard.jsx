import ProgressBar from "../ui/ProgressBar";

// Shows level, progress toward the next level, and a short recent-XP feed.
// Used on the Dashboard; built generically enough to drop onto Profile later.
function XpCard({ xp }) {
  if (!xp) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold dark:text-white">
            Level {xp.level}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {xp.xp} XP total
          </p>
        </div>

        <div className="text-3xl">⭐</div>
      </div>

      <ProgressBar value={xp.xpIntoLevel} max={xp.xpForNextLevel} />

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {xp.xpIntoLevel} / {xp.xpForNextLevel} XP to level {xp.level + 1}
      </p>

      {xp.history?.length > 0 && (
        <div className="mt-5 pt-4 border-t dark:border-slate-700 space-y-2">
          {xp.history.slice(0, 4).map((entry) => (
            <div
              key={entry._id}
              className="flex justify-between text-sm text-gray-600 dark:text-gray-300"
            >
              <span>{entry.reason}</span>
              <span className="font-semibold text-green-600">
                +{entry.amount} XP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default XpCard;
