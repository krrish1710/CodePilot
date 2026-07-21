// Shared "connect your accounts" form used by both the Dashboard and the
// Profile page, so the three input+button blocks aren't duplicated in
// two places.
function LinkedAccountsForm({
  cfHandle,
  onCfHandleChange,
  onSaveCodeforces,
  leetcodeUsername,
  onLeetcodeUsernameChange,
  onSaveLeetCode,
  githubUsername,
  onGithubUsernameChange,
  onSaveGithub,
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-8 dark:text-white">
        Linked Coding Accounts
      </h2>

      <div className="grid md:grid-cols-3 gap-10">
        <div id="codeforces">
          <h3 className="text-xl font-semibold text-blue-600 mb-4">
            Codeforces
          </h3>

          <input
            type="text"
            placeholder="Enter Codeforces Handle"
            value={cfHandle}
            onChange={(e) => onCfHandleChange(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />

          <button
            onClick={onSaveCodeforces}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Save Handle
          </button>
        </div>

        <div id="leetcode">
          <h3 className="text-xl font-semibold text-orange-500 mb-4">
            LeetCode
          </h3>

          <input
            type="text"
            placeholder="Enter LeetCode Username"
            value={leetcodeUsername}
            onChange={(e) => onLeetcodeUsernameChange(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />

          <button
            onClick={onSaveLeetCode}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
          >
            Save Username
          </button>
        </div>

        <div id="github">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            GitHub
          </h3>

          <input
            type="text"
            placeholder="Enter GitHub Username"
            value={githubUsername}
            onChange={(e) => onGithubUsernameChange(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />

          <button
            onClick={onSaveGithub}
            className="mt-4 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg"
          >
            Save Username
          </button>
        </div>
      </div>
    </div>
  );
}

export default LinkedAccountsForm;
