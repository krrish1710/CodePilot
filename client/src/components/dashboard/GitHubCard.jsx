import { GitHubCalendar } from "react-github-calendar";

function GitHubCard({ data, repos }) {
  if (!data) return null;

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 mt-8">

      {/* Profile */}

      <div className="flex items-center gap-6">

        <img
          src={data.avatar_url}
          alt="GitHub Avatar"
          className="w-24 h-24 rounded-full border"
        />

        <div>
          <h2 className="text-3xl font-bold">
            {data.login}
          </h2>

          <p className="text-gray-500 text-lg">
            {data.name}
          </p>

          {data.bio && (
            <p className="text-gray-600 mt-2">
              {data.bio}
            </p>
          )}

          <div className="flex gap-5 mt-3 text-gray-500">

            {data.location && (
              <span>📍 {data.location}</span>
            )}

            {data.company && (
              <span>🏢 {data.company}</span>
            )}

          </div>

          <a
            href={data.html_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline mt-3 inline-block"
          >
            View GitHub Profile
          </a>

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-10">

        <div className="text-center">
          <h3 className="text-3xl font-bold">
            {data.public_repos}
          </h3>
          <p className="text-gray-500">
            Repositories
          </p>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold">
            {data.followers}
          </h3>
          <p className="text-gray-500">
            Followers
          </p>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold">
            {data.following}
          </h3>
          <p className="text-gray-500">
            Following
          </p>
        </div>

      </div>

      {/* Bottom Section */}

      <div className="grid md:grid-cols-2 gap-10 mt-10">

        {/* Contribution Calendar */}

        <div>

          <h3 className="text-2xl font-bold mb-4">
            Contribution Calendar
          </h3>

          <GitHubCalendar
            username={data.login}
            blockSize={14}
            blockMargin={5}
            fontSize={14}
          />

        </div>

        {/* Top Repositories */}

        <div>

          <h3 className="text-2xl font-bold mb-4">
            Top Repositories
          </h3>

          {repos?.map((repo) => (
            <div
              key={repo.id}
              className="flex justify-between items-center py-3 border-b"
            >
              <div>
                <h4 className="font-semibold">
                  {repo.name}
                </h4>

                <p className="text-sm text-gray-500">
                  {repo.language || "Unknown"}
                </p>
              </div>

              <span className="font-semibold">
                ⭐ {repo.stargazers_count}
              </span>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default GitHubCard;