function ContestStats({ contests }) {

  if (!contests || contests.length === 0)
    return null;

  const total = contests.length;

  const maxRating = Math.max(
    ...contests.map((c) => c.newRating)
  );

  const bestRank = Math.min(
    ...contests.map((c) => c.rank)
  );

  const avgRating = Math.round(
    contests.reduce(
      (sum, c) => sum + c.newRating,
      0
    ) / total
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        Contest Statistics
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        <div>

          <h3 className="text-gray-500">
            Total Contests
          </h3>

          <h1 className="text-4xl font-bold">
            {total}
          </h1>

        </div>

        <div>

          <h3 className="text-gray-500">
            Best Rank
          </h3>

          <h1 className="text-4xl font-bold text-green-600">
            {bestRank}
          </h1>

        </div>

        <div>

          <h3 className="text-gray-500">
            Average Rating
          </h3>

          <h1 className="text-4xl font-bold text-blue-600">
            {avgRating}
          </h1>

        </div>

      </div>

      <div className="mt-8">

        <h3 className="text-gray-500">
          Maximum Rating
        </h3>

        <h1 className="text-5xl font-bold text-orange-500">
          {maxRating}
        </h1>

      </div>

    </div>
  );
}

export default ContestStats;