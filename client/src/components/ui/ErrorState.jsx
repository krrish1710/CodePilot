// Reusable error-with-retry block used by every page that loads data
// (Analytics, Goals, Profile) instead of duplicating the same markup.
function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col justify-center items-center h-60 gap-4 bg-white dark:bg-slate-800 rounded-xl shadow p-8">
      <p className="text-gray-600 dark:text-gray-300">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
