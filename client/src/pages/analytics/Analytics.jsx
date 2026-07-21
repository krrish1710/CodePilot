import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PageLayout from "../../components/layout/PageLayout";
import ErrorState from "../../components/ui/ErrorState";
import { DashboardSkeleton } from "../../components/ui/Skeleton";

import { getAnalytics, getAdvancedAnalytics } from "../../api/analytics";

import OverviewCards from "../../components/analytics/OverviewCards";
import RatingTrend from "../../components/analytics/RatingTrend";
import DifficultyChart from "../../components/analytics/DifficultyChart";
import LanguageChart from "../../components/analytics/LanguageChart";
import ContestStats from "../../components/analytics/ContestStats";
import XpTrendChart from "../../components/analytics/XpTrendChart";
import ProductivityTrendChart from "../../components/analytics/ProductivityTrendChart";
import WeekdayBreakdownChart from "../../components/analytics/WeekdayBreakdownChart";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Advanced analytics is internal-data-driven (XP/activity history) and
  // doesn't depend on any linked account, so it's fetched and rendered
  // independently - a failure or empty state here shouldn't block the
  // external-account analytics above it, or vice versa.
  const [advanced, setAdvanced] = useState(null);
  const [advancedLoading, setAdvancedLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    loadAdvancedAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError(false);

    try {
      const { data } = await getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.log(err);
      setError(true);
      toast.error("Couldn't load analytics data");
    } finally {
      setLoading(false);
    }
  }

  async function loadAdvancedAnalytics() {
    setAdvancedLoading(true);

    try {
      const { data } = await getAdvancedAnalytics();
      setAdvanced(data);
    } catch (err) {
      console.log(err);
      // Non-fatal: the rest of the analytics page still works without
      // this section, so just skip rendering it rather than erroring.
    } finally {
      setAdvancedLoading(false);
    }
  }

  return (
    <PageLayout>
      <h1 className="text-4xl font-bold mb-8 dark:text-white">
        Analytics Dashboard
      </h1>

      {loading ? (
        <DashboardSkeleton />
      ) : error || !analytics ? (
        <ErrorState
          message="Something went wrong loading analytics."
          onRetry={loadAnalytics}
        />
      ) : (
        <>
          <OverviewCards data={analytics} />

          <div className="mt-10">
            <RatingTrend contests={analytics.contests} />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            <DifficultyChart data={analytics.leetcode} />

            <LanguageChart languages={analytics.languages} />
          </div>

          <div className="mt-8">
            <ContestStats contests={analytics.contests} />
          </div>
        </>
      )}

      {!advancedLoading && advanced && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Advanced Analytics
          </h2>

          <div className="space-y-8">
            <XpTrendChart data={advanced.xpTrend} />

            <div className="grid lg:grid-cols-2 gap-8">
              <ProductivityTrendChart data={advanced.productivityTrend} />
              <WeekdayBreakdownChart data={advanced.weekdayBreakdown} />
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default Analytics;
