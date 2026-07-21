import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Cumulative XP over the last 30 days - an "are you actually improving
// over time" view that the level/progress-bar snapshot on the dashboard
// doesn't show.
function XpTrendChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({
    date: d.date.slice(5), // MM-DD
    xp: d.cumulativeXp,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        XP Growth — Last 30 Days
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="xp"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default XpTrendChart;
