import {
  Home,
  Trophy,
  Code2,
  BarChart3,
  Target,
  Calendar,
  User,
  Settings,
  Brain,
} from "lucide-react";
import { NavLink } from "react-router-dom";

// lucide-react 1.0 removed all brand/logo icons (GitHub, Twitter, etc.)
// for licensing reasons, so the GitHub mark is a small inline SVG here
// instead of a lucide import - this way it can't break again on a future
// lucide upgrade.
function GithubIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

const navItems = [
  { to: "/dashboard", icon: Home, label: "Dashboard", end: true },
  { to: "/dashboard#codeforces", icon: Trophy, label: "Codeforces" },
  { to: "/dashboard#leetcode", icon: Code2, label: "LeetCode" },
  { to: "/dashboard#github", icon: GithubIcon, label: "GitHub" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/contests", icon: Calendar, label: "Contests" },
  { to: "/coach", icon: Brain, label: "AI Coach" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-slate-800 shadow h-screen p-5 sticky top-0 overflow-y-auto transition-colors">
      <h2 className="text-xl font-bold mb-8 dark:text-white">Dashboard</h2>

      <nav className="space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex gap-3 items-center px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
