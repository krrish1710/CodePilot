import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function RatingTrend({ contests }) {
  if (!contests || contests.length === 0) return null;

  const data = contests.map((contest) => ({
    contest: contest.contestName,
    rating: contest.newRating,
  }));

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">

      <h2 className="text-2xl font-bold mb-6">
        Codeforces Rating Trend
      </h2>

      <ResponsiveContainer width="100%" height={400}>

        <LineChart data={data}>

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
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default RatingTrend;