function CodeforcesCard({ user }) {

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow p-8 mt-8">

      <div className="flex gap-5 items-center">

        <img
          src={user.avatar}
          alt=""
          className="w-24 h-24 rounded-full"
        />

        <div>

          <h2 className="text-2xl font-bold">
            {user.handle}
          </h2>

          <p>{user.rank}</p>

          <p>
            Rating : {user.rating}
          </p>

          <p>
            Max Rating : {user.maxRating}
          </p>

        </div>

      </div>

    </div>
  );
}

export default CodeforcesCard;