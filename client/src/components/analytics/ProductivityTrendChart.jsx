import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Problems logged per week - distinct from the daily streak, which can
// look "broken" in a week that still had solid problem-solving volume.
function ProductivityTrendChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({
    week: d.weekStart.slice(5),
    problems: d.problemsSolved,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Problems Solved Per Week
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="problems" fill="#16a34a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProductivityTrendChart;
