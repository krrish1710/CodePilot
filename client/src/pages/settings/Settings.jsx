import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/layout/PageLayout";
import { useTheme } from "../../context/useTheme";
import { changePassword, deleteAccount } from "../../api/auth";

// Minimal, dependency-free JWT payload decode — just for displaying
// honest session info (issued/expiry), not for any security decision.
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getSessionInfo() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = decodeJwt(token);
  if (!payload?.exp || !payload?.iat) return null;

  return {
    issuedAt: new Date(payload.iat * 1000),
    expiresAt: new Date(payload.exp * 1000),
  };
}

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const session = getSessionInfo();

  async function handleChangePassword(e) {
    e.preventDefault();

    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords don't match");
    }

    try {
      setChangingPassword(true);
      await changePassword(currentPassword, newPassword);

      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update password");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      setDeleting(true);
      await deleteAccount();

      localStorage.clear();
      toast.success("Account deleted");
      navigate("/register");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete account");
      setDeleting(false);
    }
  }

  return (
    <PageLayout>
      <h1 className="text-4xl font-bold mb-8 dark:text-white">Settings</h1>

      <div className="space-y-8 max-w-2xl">
        {/* Theme */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Appearance</h2>

          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>

            <button
              onClick={toggleTheme}
              className="relative w-14 h-8 rounded-full bg-gray-300 dark:bg-blue-600 transition-colors"
              aria-label="Toggle theme"
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  theme === "dark" ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Session info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Current Session
          </h2>

          {session ? (
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400">Signed in</h3>
                <p className="font-semibold dark:text-white">
                  {session.issuedAt.toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-gray-500 dark:text-gray-400">Expires</h3>
                <p className="font-semibold dark:text-white">
                  {session.expiresAt.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No active session found.
            </p>
          )}

          <p className="text-gray-400 text-xs mt-4">
            CodePilot only tracks a single session per login. Multi-device
            session management isn't built yet — use Logout in the top bar to
            end this session.
          </p>
        </div>

        {/* Change password */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6 dark:text-white">
            Change Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />

            <button
              type="submit"
              disabled={changingPassword}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Delete account */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-red-200 dark:border-red-900">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Danger Zone
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Deleting your account permanently removes your profile and goals.
            This can't be undone.
          </p>

          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
            >
              Delete Account
            </button>
          ) : (
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-gray-700 dark:text-gray-200 font-semibold">
                Are you sure?
              </span>

              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
              >
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </button>

              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="px-6 py-3 rounded-lg border dark:border-slate-600 dark:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default Settings;
