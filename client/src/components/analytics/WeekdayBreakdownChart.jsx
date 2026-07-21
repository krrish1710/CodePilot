import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// All-time active-day count by weekday - "which days do you actually
// show up on", not shown anywhere else (the streak calendar shows dates,
// not a weekday pattern).
function WeekdayBreakdownChart({ data }) {
  if (!data || data.every((d) => d.count === 0)) return null;

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Activity by Day of Week
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeekdayBreakdownChart;
