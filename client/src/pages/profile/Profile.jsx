import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PageLayout from "../../components/layout/PageLayout";
import ErrorState from "../../components/ui/ErrorState";
import { CardSkeleton } from "../../components/ui/Skeleton";
import LinkedAccountsForm from "../../components/dashboard/LinkedAccountsForm";

import {
  getProfile,
  updateProfileName,
  saveCodeforcesHandle,
  saveLeetCodeUsername,
  saveGithubUsername,
} from "../../api/auth";

function avatarKey() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user?.id ? `avatar_${user.id}` : null;
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [cfHandle, setCfHandle] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  const [avatar, setAvatar] = useState(() => {
    const key = avatarKey();
    return key ? localStorage.getItem(key) : null;
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError(false);

    try {
      const { data } = await getProfile();
      setProfile(data);
      setName(data.name || "");
      setCfHandle(data.codeforcesHandle || "");
      setLeetcodeUsername(data.leetcodeUsername || "");
      setGithubUsername(data.githubUsername || "");
    } catch (err) {
      console.log(err);
      setError(true);
      toast.error("Couldn't load your profile");
    } finally {
      setLoading(false);
    }
  }

  async function saveName() {
    if (!name.trim()) {
      return toast.error("Name can't be empty");
    }

    try {
      setSavingName(true);

      const { data } = await updateProfileName(name);

      // Keep the cached user (used for the Navbar greeting) in sync.
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      if (stored) {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...stored, name: data.name })
        );
      }

      setProfile((prev) => ({ ...prev, name: data.name }));
      toast.success("Name updated");
    } catch (err) {
      console.log(err);
      toast.error("Couldn't update name");
    } finally {
      setSavingName(false);
    }
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please choose an image file");
    }

    const key = avatarKey();
    if (!key) return;

    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(key, reader.result);
      setAvatar(reader.result);
      toast.success("Avatar updated");
    };
    reader.readAsDataURL(file);
  }

  async function saveCodeforces() {
    if (!cfHandle.trim()) return toast.error("Enter a Codeforces handle");
    try {
      await saveCodeforcesHandle(cfHandle);
      setProfile((prev) => ({ ...prev, codeforcesHandle: cfHandle }));
      toast.success("Codeforces connected successfully");
    } catch (err) {
      console.log(err);
      toast.error("Invalid Codeforces handle");
    }
  }

  async function saveLeetCode() {
    if (!leetcodeUsername.trim())
      return toast.error("Enter a LeetCode username");
    try {
      await saveLeetCodeUsername(leetcodeUsername);
      setProfile((prev) => ({ ...prev, leetcodeUsername }));
      toast.success("LeetCode connected successfully");
    } catch (err) {
      console.log(err);
      toast.error("Invalid LeetCode username");
    }
  }

  async function saveGithub() {
    if (!githubUsername.trim()) return toast.error("Enter a GitHub username");
    try {
      await saveGithubUsername(githubUsername);
      setProfile((prev) => ({ ...prev, githubUsername }));
      toast.success("GitHub connected successfully");
    } catch (err) {
      console.log(err);
      toast.error("Invalid GitHub username");
    }
  }

  return (
    <PageLayout>
      <h1 className="text-4xl font-bold mb-8 dark:text-white">Profile</h1>

      {loading ? (
        <CardSkeleton />
      ) : error || !profile ? (
        <ErrorState
          message="Something went wrong loading your profile."
          onRetry={loadProfile}
        />
      ) : (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-2xl">
            <div className="flex items-center gap-6 mb-8">
              <label className="relative cursor-pointer group">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold">
                    {profile.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}

                <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">
                  Change
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1">
                <div className="flex gap-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded-lg px-4 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />

                  <button
                    onClick={saveName}
                    disabled={savingName}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg"
                  >
                    {savingName ? "Saving..." : "Save"}
                  </button>
                </div>

                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                  Current Streak
                </h3>
                <p className="font-semibold dark:text-white">
                  {profile.currentStreak} days
                </p>
              </div>

              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                  Longest Streak
                </h3>
                <p className="font-semibold dark:text-white">
                  {profile.longestStreak} days
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mt-8">
              Avatar is stored on this device for now — it won't follow you to
              another browser yet.
            </p>
          </div>

          <LinkedAccountsForm
            cfHandle={cfHandle}
            onCfHandleChange={setCfHandle}
            onSaveCodeforces={saveCodeforces}
            leetcodeUsername={leetcodeUsername}
            onLeetcodeUsernameChange={setLeetcodeUsername}
            onSaveLeetCode={saveLeetCode}
            githubUsername={githubUsername}
            onGithubUsernameChange={setGithubUsername}
            onSaveGithub={saveGithub}
          />
        </div>
      )}
    </PageLayout>
  );
}

export default Profile;
