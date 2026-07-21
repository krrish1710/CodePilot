function WelcomeCard() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white rounded-xl shadow p-8">

      <h1 className="text-4xl font-bold">
        Welcome Back,
        <span className="text-blue-600">
          {" "}
          {user?.name}
        </span>
        👋
      </h1>

      <p className="text-gray-500 mt-3">
        Ready to improve your coding skills today?
      </p>

    </div>
  );
}

export default WelcomeCard;