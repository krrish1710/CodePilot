import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { loginUser } from "../../api/auth";
import { notifyAchievements } from "../../utils/notifyAchievements";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await loginUser(formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login Successful");

      if (data.xp) {
        if (data.xp.leveledUp) {
          toast.success(`🎉 Level up! You're now level ${data.xp.level}`);
        } else {
          toast.success(`+10 XP for your daily streak`);
        }
      }

      notifyAchievements(data.newAchievements);

      navigate("/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center text-blue-600">
          CodePilot
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Welcome Back 👋
        </p>

        <form onSubmit={handleSubmit}>

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Logging..." : "Login"}
          </Button>

        </form>

        <p className="mt-5 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;