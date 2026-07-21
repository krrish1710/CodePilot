function GoalCard({ title, target, completed, subtitle }) {
  const percent =
    target > 0
      ? Math.min(
          Math.round((completed / target) * 100),
          100
        )
      : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold dark:text-white">
          {title}
        </h2>

        {subtitle && (
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex justify-between mb-2 dark:text-gray-200">

        <span>
          {completed} / {target}
        </span>

        <span>
          {percent}%
        </span>

      </div>

      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4">

        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-700"
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

    </div>
  );
}

export default GoalCard;
