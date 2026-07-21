import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import PageLayout from "../../components/layout/PageLayout";
import ErrorState from "../../components/ui/ErrorState";
import { CardSkeleton } from "../../components/ui/Skeleton";
import CalendarGrid from "../../components/contests/CalendarGrid";
import ContestDayCard from "../../components/contests/ContestDayCard";

import {
  getUpcomingCFContests,
  getSavedContests,
  saveContest,
  unsaveContest,
} from "../../api/contest";

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function Contests() {
  const [contests, setContests] = useState([]);
  const [savedContests, setSavedContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  async function loadCalendar() {
    setLoading(true);
    setError(false);

    try {
      const [upcoming, saved] = await Promise.all([
        getUpcomingCFContests(),
        getSavedContests(),
      ]);

      setContests(upcoming.data);
      setSavedContests(saved.data);
    } catch (err) {
      console.log(err);
      setError(true);
      toast.error("Couldn't load the contest calendar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCalendar();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 30000); // 30s is plenty for a calendar view, unlike a live countdown

    return () => clearInterval(interval);
  }, []);

  // Merge live upcoming contests with saved ones, so a contest a user
  // starred doesn't disappear from the calendar just because it scrolled
  // out of Codeforces's short "next N contests" window.
  const combinedContests = useMemo(() => {
    const map = new Map();

    contests.forEach((c) =>
      map.set(c.id, {
        id: c.id,
        name: c.name,
        startTimeSeconds: c.startTimeSeconds,
        durationSeconds: c.durationSeconds,
      })
    );

    savedContests.forEach((s) => {
      if (!map.has(s.contestId)) {
        map.set(s.contestId, {
          id: s.contestId,
          name: s.name,
          startTimeSeconds: s.startTimeSeconds,
          durationSeconds: s.durationSeconds,
        });
      }
    });

    return Array.from(map.values());
  }, [contests, savedContests]);

  const savedIds = useMemo(
    () => new Set(savedContests.map((s) => s.contestId)),
    [savedContests]
  );

  const markedDates = useMemo(() => {
    const map = new Map();

    for (const c of combinedContests) {
      const key = toDateKey(new Date(c.startTimeSeconds * 1000));
      map.set(key, (map.get(key) || 0) + 1);
    }

    return map;
  }, [combinedContests]);

  const selectedKey = toDateKey(selectedDate);

  const dayContests = combinedContests
    .filter((c) => toDateKey(new Date(c.startTimeSeconds * 1000)) === selectedKey)
    .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);

  // Default "agenda" view - nearest contest first, independent of
  // whatever day is selected on the calendar - so the page is useful
  // immediately without requiring a day click first.
  const nextUpContests = combinedContests
    .filter((c) => c.startTimeSeconds > now)
    .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
    .slice(0, 5);

  async function handleToggleSave(contest) {
    try {
      if (savedIds.has(contest.id)) {
        await unsaveContest(contest.id);
        setSavedContests((prev) => prev.filter((s) => s.contestId !== contest.id));
        toast.success("Removed from saved contests");
      } else {
        const { data } = await saveContest({
          contestId: contest.id,
          name: contest.name,
          startTimeSeconds: contest.startTimeSeconds,
          durationSeconds: contest.durationSeconds,
        });
        setSavedContests((prev) => [...prev, data]);
        toast.success("Contest saved");
      }
    } catch (err) {
      console.log(err);
      toast.error("Couldn't update saved contest");
    }
  }

  return (
    <PageLayout>
      <h1 className="text-4xl font-bold mb-8 dark:text-white">
        📅 Contest Calendar
      </h1>

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-8">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          message="Something went wrong loading the contest calendar."
          onRetry={loadCalendar}
        />
      ) : (
        <>
          {nextUpContests.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
              <h3 className="font-bold text-lg mb-4 dark:text-white">
                Next Up
              </h3>

              <div className="space-y-4">
                {nextUpContests.map((contest) => (
                  <ContestDayCard
                    key={contest.id}
                    contest={contest}
                    now={now}
                    saved={savedIds.has(contest.id)}
                    onToggleSave={() => handleToggleSave(contest)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <CalendarGrid
              monthDate={monthDate}
              markedDates={markedDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onMonthChange={setMonthDate}
            />

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 dark:text-white">
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>

              {dayContests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No contests on this day.
                </p>
              ) : (
                <div className="space-y-4">
                  {dayContests.map((contest) => (
                    <ContestDayCard
                      key={contest.id}
                      contest={contest}
                      now={now}
                      saved={savedIds.has(contest.id)}
                      onToggleSave={() => handleToggleSave(contest)}
                    />
                  ))}
                </div>
              )}

              {savedContests.length > 0 && (
                <div className="mt-8 pt-6 border-t dark:border-slate-700">
                  <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-3">
                    ⭐ All saved contests ({savedContests.length})
                  </h4>

                  <div className="space-y-2">
                    {savedContests
                      .slice()
                      .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
                      .map((s) => (
                        <button
                          key={s.contestId}
                          onClick={() =>
                            setSelectedDate(new Date(s.startTimeSeconds * 1000))
                          }
                          className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                        >
                          {s.name} —{" "}
                          {new Date(s.startTimeSeconds * 1000).toLocaleDateString()}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}

export default Contests;
