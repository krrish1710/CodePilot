import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PageLayout from "../../components/layout/PageLayout";

import WelcomeCard from "../../components/dashboard/WelcomeCard";
import StatsCard from "../../components/dashboard/StatsCard";
import CodeforcesCard from "../../components/dashboard/CodeforcesCard";
import RatingChart from "../../components/dashboard/RatingChart";
import ContestHistory from "../../components/dashboard/ContestHistory";
import GitHubCard from "../../components/dashboard/GitHubCard";
import LeetCodeCard from "../../components/dashboard/LeetCodeCard";
import LinkedAccountsForm from "../../components/dashboard/LinkedAccountsForm";
import XpCard from "../../components/dashboard/XpCard";
import AchievementsGrid from "../../components/dashboard/AchievementsGrid";
import UpcomingContests from "../../components/dashboard/UpcomingContests";
import StreakCard from "../../components/dashboard/StreakCard";
import StreakCalendar from "../../components/dashboard/StreakCalendar";
import GoalCard from "../../components/dashboard/GoalCard";
import { DashboardSkeleton } from "../../components/ui/Skeleton";

import {
  getProfile,
  saveCodeforcesHandle,
  saveLeetCodeUsername,
  saveGithubUsername,
} from "../../api/auth";

import { getCodeforcesUser } from "../../api/codeforces";
import { getRatingHistory } from "../../api/rating";
import { getLeetCodeProfile } from "../../api/leetcode";
import { getGithubProfile, getGithubRepos } from "../../api/github";
import { getXpStatus } from "../../api/xp";
import { getAchievements } from "../../api/achievements";
import { getStreakStatus } from "../../api/streak";
import { getGoals } from "../../api/goals";
import { notifyAchievements } from "../../utils/notifyAchievements";
import { Link } from "react-router-dom";

const GOAL_POLL_INTERVAL_MS = 60000;

function Dashboard() {
  const [loading, setLoading] = useState(false);

  const [cfHandle, setCfHandle] = useState("");
  const [cfUser, setCfUser] = useState(null);
  const [ratingHistory, setRatingHistory] = useState([]);

  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [leetcodeData, setLeetcodeData] = useState(null);

  const [githubUsername, setGithubUsername] = useState("");
  const [githubData, setGithubData] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);

  const [profile, setProfile] = useState(null);
  const [xp, setXp] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [streak, setStreak] = useState(null);
  const [goals, setGoals] = useState(null);

  async function loadProfile() {
    try {
      setLoading(true);

      const { data } = await getProfile();
      setProfile(data);

      const xpStatus = await getXpStatus();
      setXp(xpStatus.data);

      const achievementStatus = await getAchievements();
      setAchievements(achievementStatus.data);

      const streakStatus = await getStreakStatus();
      setStreak(streakStatus.data);

      await loadGoals();

      // Codeforces
      if (data.codeforcesHandle) {
        setCfHandle(data.codeforcesHandle);

        const cf = await getCodeforcesUser(data.codeforcesHandle);
        setCfUser(cf.data);

        const history = await getRatingHistory(data.codeforcesHandle);
        setRatingHistory(history.data);
      }

      // LeetCode
      if (data.leetcodeUsername) {
        setLeetcodeUsername(data.leetcodeUsername);

        const lc = await getLeetCodeProfile(data.leetcodeUsername);
        setLeetcodeData(lc.data);
      }

      // GitHub
      if (data.githubUsername) {
        setGithubUsername(data.githubUsername);

        const github = await getGithubProfile(data.githubUsername);
        setGithubData(github.data);

        const repos = await getGithubRepos(data.githubUsername);
        setGithubRepos(repos.data);
      }
    } catch (err) {
      console.log(err);
      toast.error("Couldn't load your profile. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  // Goal progress is computed automatically from linked Codeforces/
  // LeetCode accounts, so a plain GET keeps it current - no manual
  // "log progress" action needed.
  async function loadGoals() {
    try {
      const { data } = await getGoals();
      setGoals(data);
      notifyAchievements(data.newAchievements);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    loadProfile();

    const interval = setInterval(() => {
      loadGoals();
    }, GOAL_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading]);

  async function saveCodeforces() {
    if (!cfHandle.trim()) {
      return toast.error("Enter a Codeforces handle");
    }

    try {
      const { data: saveData } = await saveCodeforcesHandle(cfHandle);

      const cf = await getCodeforcesUser(cfHandle);
      setCfUser(cf.data);

      const history = await getRatingHistory(cfHandle);
      setRatingHistory(history.data);

      const { data } = await getAchievements();
      setAchievements(data);
      notifyAchievements(saveData.newAchievements);

      toast.success("Codeforces connected successfully");
    } catch (err) {
      console.log(err);
      toast.error("Invalid Codeforces handle");
    }
  }

  async function saveLeetCode() {
    if (!leetcodeUsername.trim()) {
      return toast.error("Enter a LeetCode username");
    }

    try {
      const { data: saveData } = await saveLeetCodeUsername(leetcodeUsername);

      const lc = await getLeetCodeProfile(leetcodeUsername);
      setLeetcodeData(lc.data);

      const { data } = await getAchievements();
      setAchievements(data);
      notifyAchievements(saveData.newAchievements);

      toast.success("LeetCode connected successfully");
    } catch (err) {
      console.log(err);
      toast.error("Invalid LeetCode username");
    }
  }

  async function saveGithub() {
    if (!githubUsername.trim()) {
      return toast.error("Enter a GitHub username");
    }

    try {
      const { data: saveData } = await saveGithubUsername(githubUsername);

      const github = await getGithubProfile(githubUsername);
      setGithubData(github.data);

      const repos = await getGithubRepos(githubUsername);
      setGithubRepos(repos.data);

      const { data } = await getAchievements();
      setAchievements(data);
      notifyAchievements(saveData.newAchievements);

      toast.success("GitHub connected successfully");
    } catch (err) {
      console.log(err);
      toast.error("Invalid GitHub username");
    }
  }

  const topRepos = [...githubRepos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  return (
    <PageLayout>
      <WelcomeCard />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <StatsCard
          title="Problems Solved"
          value={leetcodeData?.totalSolved || "0"}
        />

        <StatsCard title="Codeforces Rating" value={cfUser?.rating || "--"} />

        <StatsCard title="Max Rating" value={cfUser?.maxRating || "--"} />

        <StatsCard title="Rank" value={cfUser?.rank || "--"} />
      </div>

      {xp && (
        <div className="mt-8">
          <XpCard xp={xp} />
        </div>
      )}

      {achievements && (
        <div className="mt-8">
          <AchievementsGrid achievements={achievements} />
        </div>
      )}

      <StreakCard profile={profile} />

      {streak?.calendar && (
        <div className="mt-8">
          <StreakCalendar calendar={streak.calendar} />
        </div>
      )}

      {goals && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold dark:text-white">🎯 Goals</h2>
            <Link
              to="/goals"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              View all goals
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GoalCard
              title="Daily Goal"
              target={goals.dailyTarget}
              completed={goals.dailyCompleted}
              subtitle="Auto"
            />
            <GoalCard
              title="Weekly Goal"
              target={goals.weeklyTarget}
              completed={goals.weeklyCompleted}
              subtitle="Auto"
            />
            <GoalCard
              title="Monthly Goal"
              target={goals.monthlyTarget}
              completed={goals.monthlyCompleted}
              subtitle="Auto"
            />
          </div>
        </div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="mt-8">
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

          {cfUser && (
            <div className="mt-8">
              <CodeforcesCard user={cfUser} />
            </div>
          )}

          {ratingHistory.length > 0 && (
            <div className="mt-8">
              <RatingChart data={ratingHistory} />
            </div>
          )}

          {ratingHistory.length > 0 && (
            <div className="mt-8">
              <ContestHistory contests={ratingHistory} />
            </div>
          )}

          <div id="contests" className="mt-8">
            <UpcomingContests />
          </div>

          {leetcodeData && (
            <div className="mt-8">
              <LeetCodeCard data={leetcodeData} />
            </div>
          )}

          {githubData && (
            <div className="mt-8">
              <GitHubCard data={githubData} repos={topRepos} />
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}

export default Dashboard;
