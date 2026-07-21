// Simple animated placeholder block for loading states, replacing plain
// "Loading..." text across the app.
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

export default Skeleton;
