function ContestHistory({ contests }) {
  if (!contests || contests.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6">
        Contest History
      </h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3">Contest</th>
            <th className="text-center py-3">Rank</th>
            <th className="text-center py-3">Old</th>
            <th className="text-center py-3">New</th>
            <th className="text-center py-3">Change</th>
          </tr>
        </thead>

        <tbody>
          {contests
            .slice()
            .reverse()
            .map((contest) => {
              const diff = contest.newRating - contest.oldRating;

              return (
                <tr
                  key={contest.contestId}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="py-3">
                    {contest.contestName}
                  </td>

                  <td className="text-center">
                    {contest.rank}
                  </td>

                  <td className="text-center">
                    {contest.oldRating}
                  </td>

                  <td className="text-center">
                    {contest.newRating}
                  </td>

                  <td
                    className={`text-center font-semibold ${
                      diff >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {diff >= 0 ? "+" : ""}
                    {diff}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default ContestHistory;