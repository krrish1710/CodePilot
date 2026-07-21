function LeetCodeCard({ data }) {
  if (!data) return null;

  const profile = data.matchedUser?.profile;
  const contest = data.userContestRanking;

  const solved =
    data.matchedUser?.submitStats?.acSubmissionNum || [];

  const easy =
    solved.find((x) => x.difficulty === "Easy")?.count || 0;

  const medium =
    solved.find((x) => x.difficulty === "Medium")?.count || 0;

  const hard =
    solved.find((x) => x.difficulty === "Hard")?.count || 0;

  return (
    <div className="bg-white rounded-xl shadow p-8 mt-8">

      <div className="flex items-center gap-6">

        <img
          src={profile?.userAvatar}
          alt="avatar"
          className="w-24 h-24 rounded-full"
        />

        <div>

          <h2 className="text-2xl font-bold">
            {data.matchedUser?.username}
          </h2>

          <p>{profile?.realName}</p>

          <p>Global Rank : {profile?.ranking}</p>

        </div>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-8">

        <div className="bg-orange-100 rounded-lg p-4">
          <h3 className="font-semibold">Contest Rating</h3>
          <p className="text-2xl font-bold">
            {contest?.rating?.toFixed(0) || "--"}
          </p>
        </div>

        <div className="bg-green-100 rounded-lg p-4">
          <h3 className="font-semibold">Easy</h3>
          <p className="text-2xl font-bold">{easy}</p>
        </div>

        <div className="bg-yellow-100 rounded-lg p-4">
          <h3 className="font-semibold">Medium</h3>
          <p className="text-2xl font-bold">{medium}</p>
        </div>

        <div className="bg-red-100 rounded-lg p-4">
          <h3 className="font-semibold">Hard</h3>
          <p className="text-2xl font-bold">{hard}</p>
        </div>

        <div className="bg-blue-100 rounded-lg p-4">
          <h3 className="font-semibold">Global Contest Rank</h3>
          <p className="text-xl font-bold">
            {contest?.globalRanking || "--"}
          </p>
        </div>

        <div className="bg-purple-100 rounded-lg p-4">
          <h3 className="font-semibold">Contests</h3>
          <p className="text-2xl font-bold">
            {contest?.attendedContestsCount || 0}
          </p>
        </div>

      </div>

    </div>
  );
}

export default LeetCodeCard;