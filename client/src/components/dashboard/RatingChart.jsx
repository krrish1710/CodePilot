import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function RatingChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((contest) => ({
    contest: contest.contestName,
    rating: contest.newRating,
  }));

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Rating Progress
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="contest"
            hide
          />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="rating"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RatingChart;