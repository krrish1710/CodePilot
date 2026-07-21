import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

// Generic month-grid calendar. `markedDates` is a Map of "YYYY-MM-DD" ->
// count, used to show a dot/badge on days that have contests. Not
// contest-specific by design, so it could back a future calendar feature
// (e.g. activity or goals) without duplicating the grid logic.
function CalendarGrid({ monthDate, markedDates, selectedDate, onSelectDate, onMonthChange }) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Mon=0..Sun=6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayKey = toDateKey(new Date());
  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;

  const cells = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(new Date(year, month - 1, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} className="dark:text-white" />
        </button>

        <h3 className="font-bold text-lg dark:text-white">
          {monthDate.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </h3>

        <button
          onClick={() => onMonthChange(new Date(year, month + 1, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Next month"
        >
          <ChevronRight size={20} className="dark:text-white" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;

          const key = toDateKey(date);
          const count = markedDates.get(key) || 0;
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          return (
            <button
              key={key}
              onClick={() => onSelectDate(date)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : isToday
                  ? "bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {date.getDate()}
              {count > 0 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? "bg-white" : "bg-orange-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;
