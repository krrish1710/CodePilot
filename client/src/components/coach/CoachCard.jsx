import {
  TrendingDown,
  Target,
  Flame,
  Zap,
  CheckCircle2,
  Heart,
  Sparkles,
} from "lucide-react";

// One recommendation card. Icon/color come from `category`, kept as a
// lookup here rather than the backend so the visual language stays a
// pure frontend concern - the API just returns { category, ... }.
const CATEGORY_META = {
  weak_topics: { icon: TrendingDown, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  daily_targets: { icon: Target, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  contest_prep: { icon: Zap, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
  consistency: { icon: Flame, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
  xp_optimization: { icon: Sparkles, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  goal_completion: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
  motivation: { icon: Heart, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30" },
};

const PRIORITY_LABEL = {
  high: "Priority",
  medium: null,
  low: null,
};

function CoachCard({ recommendation }) {
  const meta = CATEGORY_META[recommendation.category] || {
    icon: Sparkles,
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-slate-700/40",
  };

  const Icon = meta.icon;
  const priorityLabel = PRIORITY_LABEL[recommendation.priority];

  return (
    <div className={`rounded-xl p-5 ${meta.bg} border border-transparent`}>
      <div className="flex items-start gap-3">
        <div className={`${meta.color} shrink-0 mt-0.5`}>
          <Icon size={20} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold dark:text-white">
              {recommendation.title}
            </h4>

            {priorityLabel && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                {priorityLabel}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {recommendation.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CoachCard;
