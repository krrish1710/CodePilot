import ProgressBar from "../ui/ProgressBar";

// A single achievement tile — locked (dimmed, with progress) or unlocked
// (full color, unlock date). Used by AchievementsGrid; kept standalone so
// it could be reused on a future Profile achievements section too.
function AchievementBadge({ achievement }) {
  const { icon, title, description, unlocked, unlockedAt, progress } =
    achievement;

  return (
    <div
      className={`rounded-xl border p-4 text-center transition-opacity ${
        unlocked
          ? "bg-white dark:bg-slate-800 border-yellow-300 dark:border-yellow-600"
          : "bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 opacity-60"
      }`}
      title={description}
    >
      <div className="text-4xl mb-2">{icon}</div>

      <h4 className="font-semibold text-sm dark:text-white">{title}</h4>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
        {description}
      </p>

      {unlocked ? (
        <p className="text-xs text-green-600 font-semibold">
          Unlocked {new Date(unlockedAt).toLocaleDateString()}
        </p>
      ) : (
        <>
          <ProgressBar value={progress} max={100} colorClass="bg-gray-400" />
          <p className="text-xs text-gray-400 mt-1">{progress}%</p>
        </>
      )}
    </div>
  );
}

export default AchievementBadge;
