// GitHub-style 90-day activity heatmap, driven by the `calendar` array
// returned from GET /api/streak ({ date, active }, oldest first).
function StreakCalendar({ calendar }) {
  if (!calendar?.length) return null;

  // Pad the front so the grid always starts on a Monday column.
  const first = new Date(calendar[0].date);
  const leadingBlanks = (first.getDay() + 6) % 7; // Mon=0 ... Sun=6

  const cells = [
    ...Array(leadingBlanks).fill(null),
    ...calendar,
  ];

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4 dark:text-white">
        Activity — last 90 days
      </h3>

      <div className="flex gap-1 overflow-x-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) =>
              day ? (
                <div
                  key={di}
                  title={day.date}
                  className={`w-3 h-3 rounded-sm ${
                    day.active
                      ? "bg-green-500"
                      : "bg-gray-200 dark:bg-slate-700"
                  }`}
                />
              ) : (
                <div key={di} className="w-3 h-3" />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StreakCalendar;
