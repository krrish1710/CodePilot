import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <nav className="bg-white dark:bg-slate-800 shadow px-8 py-4 flex justify-between items-center transition-colors">
      <h1 className="text-3xl font-bold text-blue-600">
        CodePilot
      </h1>

      <div className="flex items-center gap-5">
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          {user?.name}
        </span>

        <NotificationBell />

        <button
          onClick={logout}
          className="text-red-500 hover:text-red-700"
        >
          <LogOut />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;