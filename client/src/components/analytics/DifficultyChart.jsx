import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

function DifficultyChart({ data }) {
  if (!data) return null;

  const chartData = [
    {
      name: "Easy",
      value: data.easySolved || 0,
    },
    {
      name: "Medium",
      value: data.mediumSolved || 0,
    },
    {
      name: "Hard",
      value: data.hardSolved || 0,
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">

      <h2 className="text-2xl font-bold mb-5">
        LeetCode Difficulty
      </h2>

      <ResponsiveContainer width="100%" height={350}>

        <PieChart>

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

    </div>
  );
}

export default DifficultyChart;