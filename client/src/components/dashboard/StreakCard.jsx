function StreakCard({ profile }) {
  if (!profile) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        🔥 Coding Streak
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-500">
            {profile.currentStreak}
          </h1>

          <p className="text-gray-500 dark:text-gray-400">
            Current
          </p>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600">
            {profile.longestStreak}
          </h1>

          <p className="text-gray-500 dark:text-gray-400">
            Best
          </p>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">
            {profile.weeklyStreak ?? 0}
          </h1>

          <p className="text-gray-500 dark:text-gray-400">
            Weeks
          </p>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-600">
            {profile.monthlyStreak ?? 0}
          </h1>

          <p className="text-gray-500 dark:text-gray-400">
            Months
          </p>
        </div>

        <div className="text-center">
          <h1 className="text-lg font-bold dark:text-white">
            {profile.lastLogin
              ? new Date(profile.lastLogin).toLocaleDateString()
              : "--"}
          </h1>

          <p className="text-gray-500 dark:text-gray-400">
            Last Login
          </p>
        </div>

      </div>
    </div>
  );
}

export default StreakCard;
