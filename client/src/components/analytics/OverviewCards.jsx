function OverviewCards({ data }) {
  return (
    <div className="grid md:grid-cols-4 gap-6">

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-gray-500">
          CF Rating
        </h3>

        <h1 className="text-4xl font-bold mt-3 text-blue-600">
          {data.codeforces?.rating || "--"}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-gray-500">
          Max Rating
        </h3>

        <h1 className="text-4xl font-bold mt-3 text-green-600">
          {data.codeforces?.maxRating || "--"}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-gray-500">
          GitHub Repositories
        </h3>

        <h1 className="text-4xl font-bold mt-3">
          {data.github?.public_repos || 0}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-gray-500">
          LeetCode Solved
        </h3>

        <h1 className="text-4xl font-bold mt-3 text-orange-500">
          {data.leetcode?.totalSolved || 0}
        </h1>
      </div>

    </div>
  );
}

export default OverviewCards;