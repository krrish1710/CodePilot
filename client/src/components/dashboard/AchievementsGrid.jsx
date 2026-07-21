import AchievementBadge from "./AchievementBadge";

// Renders the full achievement catalog. Receives data via props (fetched
// once by the parent page) rather than fetching itself, matching how
// XpCard is used on the Dashboard.
function AchievementsGrid({ achievements }) {
  if (!achievements?.length) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold dark:text-white">Achievements</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {unlockedCount} / {achievements.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {achievements.map((a) => (
          <AchievementBadge key={a.key} achievement={a} />
        ))}
      </div>
    </div>
  );
}

export default AchievementsGrid;
