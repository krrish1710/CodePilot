// Reusable progress bar used by XP level progress, goal completion, and
// (later) achievement progress — one implementation instead of each
// feature drawing its own bar.
function ProgressBar({ value, max = 100, colorClass = "bg-blue-600" }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass} rounded-full transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default ProgressBar;
