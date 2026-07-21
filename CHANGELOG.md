# Changelog

## [Unreleased] — Goal System Refactor: automatic progress tracking

Goal progress no longer requires manual input. Daily/weekly/monthly
problem-solving progress is now computed automatically from a user's
linked Codeforces and LeetCode accounts; manual input is reserved only
for goals that genuinely can't be fetched that way (e.g. revision
sessions, study hours).

### Backend
- **Removed** `POST /api/goals/progress` (the old "I solved a problem
  today" manual-log endpoint) and its controller/route.
- Added `services/codeforcesService.js`, consolidating every Codeforces
  API call in one place. `codeforcesController` and
  `profileAnalyticsService` previously each made their own duplicate
  `user.info`/`user.rating` axios calls; both now call through this
  shared service. Also adds `fetchUserSubmissions` (`user.status`), used
  by the new goal-progress sync.
- Added `fetchRecentAcSubmissions` to the existing `leetcodeService.js`
  (GraphQL `recentAcSubmissionList`), reusing the same shared GraphQL
  client rather than a second implementation.
- Added `models/SolvedProblem.js` — a per-user ledger of problems solved,
  as detected from linked accounts, unique-indexed on
  `(user, source, problemKey)` so re-syncing the same underlying
  submission is always a no-op rather than double-counting or
  double-awarding XP.
- Added `services/goalProgressService.js`, the new core of the goal
  system:
  - Fetches Codeforces + LeetCode solve data via the services above —
    **exactly one call to each** per sync, satisfying "don't duplicate
    API calls" even though both the Dashboard and Goals page (and a
    background poll on each) trigger it.
  - Dedupes to the earliest accepted submission per problem, persists any
    newly-seen ones.
  - Awards XP and records streak activity only for problems solved
    **today**, not for every newly-discovered row — otherwise a user's
    very first sync would retroactively hand out XP for their entire
    historical Codeforces/LeetCode solve count. Older solves are still
    recorded in the ledger (so weekly/monthly counts are accurate), just
    without XP/streak side effects.
  - Recomputes and caches `dailyCompleted`/`weeklyCompleted`/
    `monthlyCompleted` on the `Goal` document from the ledger, using the
    same UTC day/ISO-week/month boundaries `goalResetService` already
    used (extracted into `utils/dateWindows.js` so there's one shared
    definition instead of two that could drift).
  - Fires the existing "goal completed" notifications on crossing
    (daily/weekly/monthly, independently, exactly once) — moved here from
    the removed manual endpoint, since this is where completion counts
    now actually change.
- `models/Goal.js`: `dailyCompleted`/`weeklyCompleted`/`monthlyCompleted`
  are now a synced cache rather than manually-incremented counters. Added
  `lastSyncedAt`. Added `manualGoals` (label/target/completed
  subdocuments) for goals that can't be fetched automatically.
- `goalController.getGoals` now syncs automatically on every call (page
  load or the frontend's periodic poll) and runs the achievement check,
  so achievements tied to goal progress keep unlocking without a manual
  trigger. Added `addManualGoal`, `updateManualGoalProgress`,
  `deleteManualGoal` for the manual-only goal type.
- `reminderService.checkDailyGoalReminders`/`checkWeeklyGoalReminders`
  now sync each candidate via `goalProgressService` before checking
  their threshold, instead of trusting the `Goal` cache as-is — a user
  who hasn't opened the app that day would otherwise be evaluated
  against a stale number.
- `authController.deleteAccount` now also cleans up `SolvedProblem`
  records for the deleted user.
- XP and achievements: unaffected structurally.
  `advancedAnalyticsService.getProductivityTrend` still filters
  `XpHistory` by the exact reason string `"Logged a problem solved"` —
  the new auto-detected solves reuse that same string so the existing
  chart keeps working unmodified. `achievementDefinitions`'s
  `goal_crusher` still reads `Goal.dailyCompleted`/`dailyTarget` directly
  and needed no change.

### Frontend
- `api/goals.js`: removed `logGoalProgress`; added `addManualGoal`,
  `updateManualGoalProgress`, `deleteManualGoal`.
- `components/dashboard/GoalCard.jsx`: dark-mode support, optional
  "Auto" subtitle badge to distinguish auto-tracked goals from manual
  ones.
- `pages/goals/Goals.jsx`: removed the manual "I solved a problem"
  button entirely. Added a "synced Xm ago" indicator and a 60-second
  background auto-refresh (same polling pattern `NotificationBell`
  already used), plus a new Manual Goals section (add a goal with a
  label/target, +1 progress, remove).
- `pages/dashboard/Dashboard.jsx`: added a live Goals summary section
  (daily/weekly/monthly cards + a link to the full Goals page) — the
  Dashboard previously showed no goal information at all. Same 60s
  polling pattern as the Goals page, so it stays current without a
  manual refresh.

### Verified
- Every file under `server/` (recursively) passes `node -c` syntax
  checking, including all new and modified files.
- Manually reviewed the Codeforces-submission and LeetCode-AC-submission
  normalization/dedup logic, the daily-only XP-eligibility filter, and
  the goal-completion crossing-notification logic for correctness.
- Manually reviewed `Dashboard.jsx`/`Goals.jsx` for hook order, prop
  shapes, and JSX balance.
- Confirmed no remaining references to the removed
  `logGoalProgress`/`POST /goals/progress` anywhere in `client/` or
  `server/`.
- `npm install`, `vite build`, and ESLint could not be run in this
  sandbox (no network access — a pre-existing limitation, see `NOTES.md`
  and earlier changelog entries). Live MongoDB integration (confirming
  `SolvedProblem` upserts, the unique-index race-handling path, and real
  Codeforces/LeetCode API response shapes) could not be verified for the
  same reason.

## [Unreleased] — Phase 3: Contest Calendar & Notifications extensions

Both features already existed from earlier Phase 3 work. This pass
audited them against a more detailed specification and filled the real
gaps rather than rebuilding either from scratch.

### Contest Calendar
- Added contest **duration** display to the dedicated Contest Calendar
  page's cards (the dashboard's compact card already had it; the
  calendar page's `ContestDayCard` didn't).
- Labeled start times "(your local time)" — they were already using the
  browser's local timezone via `toLocaleString()`, just not labeled.
- Added a **"Next Up" agenda section**, sorted nearest-contest-first,
  shown by default above the calendar grid — previously contests only
  appeared once a specific day was clicked.

### Notifications
- Extracted `services/contestService.js` (`fetchUpcomingCFContests`) out
  of `contestController` so the new reminder job reuses the exact same
  Codeforces-fetch logic instead of duplicating it.
- Expanded `Notification`'s type enum: `contest_reminder`,
  `daily_goal_reminder`, `weekly_goal_reminder`, `goal_completed`
  (previously only `achievement`/`level_up`).
- Added `services/reminderService.js` + `jobs/reminderJobs.js`:
  - **Contest reminders** — tied to `SavedContest` (contests the user
    explicitly starred on the Calendar), not blasted to every user for
    every contest; checked every 15 minutes against a 30-minute window.
    `SavedContest.reminderSent` prevents duplicates.
  - **Daily goal reminders** — once a day (20:00 UTC, a few hours before
    the daily reset) for anyone behind their daily target.
  - **Weekly goal reminders** — Saturday 20:00 UTC, a day before the
    Monday weekly reset.
  - All background cron jobs, independent of login — same architecture
    as the existing goal-reset jobs.
- Added **"goal completed"** notifications in `goalController.logProgress`
  — fires exactly once per crossing (daily/weekly/monthly independently
  tracked), not on every subsequent log after the target's already met.
- Added `DELETE /api/notifications/:id` and a delete button in the
  notification panel (previously mark-read only).
- Made the notification panel responsive
  (`max-w-[calc(100vw-2rem)]` instead of a fixed `w-80` that could
  overflow narrow viewports).

### Verified
- Backend syntax check, full boot check (both `goalResetJobs` and the
  new `reminderJobs` registering), route mounting confirmed.
- Countdown-timer math tested standalone against known time deltas,
  including boundary cases (exactly 24h, just-under-an-hour, already
  started).
- Goal-completion crossing logic and the contest-reminder window
  verified by code review.
- ESLint clean apart from the same 5 pre-documented fetch-on-mount
  findings — no new issue class.
- New icon (`Trash2`) checked directly against the installed
  lucide-react package.
- MongoDB/notification-persistence integration testing not possible in
  this sandbox (no network, no local MongoDB) — see `NOTES.md`.

---

## [Unreleased] — Phase 3: AI Coding Coach (rule-based, no external LLM)

### Added
- `services/profileAnalyticsService.js` — extracted the inline
  Codeforces/GitHub/LeetCode fetch logic out of `analyticsController`
  (pure, behavior-preserving extraction) so both the Analytics page and
  the new Coach reuse the exact same code instead of the Coach
  duplicating it. `analyticsController.getAnalytics` is now a thin
  wrapper around this service.
- `services/aiCoachService.js` — split into `gatherCoachingContext`
  (reuses `profileAnalyticsService`, `streakService`, `xpService`,
  `advancedAnalyticsService` — no analytics logic duplicated) and
  `generateRecommendations` (runs 7 independent, pure rule functions
  over that context). This split is the intentional seam for a future
  LLM: `gatherCoachingContext` stays as-is, and a future version would
  build a prompt from its output instead of running the rule functions,
  parsing the model's response into the same `{ id, category, title,
  message, priority }` shape. The controller, routes, and frontend never
  need to change for that swap.
- Recommendation categories, each grounded in data actually tracked (no
  fabricated signals like topic-tags we don't collect):
  - **Weak areas** — LeetCode difficulty-tier ratio, Codeforces contest count
  - **Suggested daily target** — from actual weekly throughput vs the
    configured goal target
  - **Contest prep** — Codeforces rating trend over recent contests
  - **Consistency warnings** — current streak vs personal-best streak
  - **XP optimization** — passive (login) vs earned (problem-solved) XP ratio
  - **Goal completion advice** — daily/weekly target pace
  - **Motivational insight** — always returns something, so the coach
    never shows an empty or discouraging list
- `controllers/aiCoachController.js`, `routes/aiCoachRoutes.js` —
  `GET /api/coach`.
- Frontend: `pages/coach/Coach.jsx`, reusable `CoachCard` (styled by
  category, not hardcoded per recommendation), `api/coach.js`. Wired into
  the Sidebar and routes.

### Verified
- Backend syntax check, full boot check, route mounting confirmed.
- ESLint clean apart from one new instance of the same pre-documented
  fetch-on-mount finding (now 5 total across the app — see `NOTES.md`).
- New icons (`Brain`, `RefreshCw`, `TrendingDown`, `Target`, `Flame`,
  `Zap`, `CheckCircle2`, `Heart`, `Sparkles`) checked directly against
  the installed lucide-react package before use.
- Confirmed no other consumer of the extracted CF/GitHub/LeetCode fetch
  logic was broken by the `profileAnalyticsService` extraction.

---

## [Unreleased] — Phase 3: Advanced Analytics

### Added
- `services/advancedAnalyticsService.js` — three new trends, all derived
  from data already tracked internally rather than duplicating the
  existing external-API analytics (Codeforces/GitHub/LeetCode profile
  snapshots, served by `GET /api/analytics`):
  - **XP growth trend** (30-day cumulative, from `XpHistory`)
  - **Productivity trend** (problems logged per ISO week, from
    `XpHistory` entries reasoned `"Logged a problem solved"`) — distinct
    from the daily streak, which can look broken in a week that still
    had solid problem-solving volume
  - **Weekday activity breakdown** (all-time, from `Activity`) — answers
    "which days do you actually show up on", which neither the streak
    calendar nor the existing analytics page shows
- `GET /api/analytics/advanced`.
- Frontend: `XpTrendChart`, `ProductivityTrendChart`,
  `WeekdayBreakdownChart`; wired into the Analytics page as an
  independently-loaded section — a failure or empty state here doesn't
  block (or get blocked by) the existing linked-account analytics above it.

### Verified
- Backend syntax check, full boot check, route mounting confirmed.
- ESLint clean apart from the same 4 pre-documented fetch-on-mount
  findings — no new instance from this feature.

---

## [Unreleased] — Phase 3: Notifications

### Added
- `models/Notification.js` — durable, per-user notifications (type,
  title, message, read state).
- `services/notificationService.js` — a single `createNotification`
  path, plus list/unread-count/mark-read/mark-all-read, so every
  notification-generating event goes through the same shape instead of
  each caller building its own document.
- Level-ups (`xpService.awardXp`) and achievement unlocks
  (`achievementService.checkAndUnlock`) now create a durable notification
  alongside the toast they already fired — a toast is ephemeral and gets
  missed if it happens during a background call or the user isn't
  looking; the notification survives.
- `GET /api/notifications`, `GET /api/notifications/unread-count`,
  `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`.
- Frontend: `NotificationBell` in the Navbar (unread-count badge, dropdown
  panel, mark-one/mark-all read, 60s polling for the badge count),
  `api/notifications.js`.

### Verified
- Backend syntax check, full boot check, route mounting confirmed.
- ESLint clean apart from one new instance of the same pre-documented
  fetch-on-mount finding (see `NOTES.md`).
- New icons (`Bell`, `Check`, `CheckCheck`) checked directly against the
  installed lucide-react package before use.
- No circular requires introduced: `xpService` and `achievementService`
  both depend on `notificationService`, which depends on nothing from
  either of them.

---

## [Unreleased] — Phase 3: Contest Calendar

### Added
- `models/SavedContest.js` — a user's starred/tracked contests, unique per
  (user, contestId). This is the actual per-user, MongoDB-backed part of
  the feature; the contest list itself is still fetched live from
  Codeforces, not stored.
- `GET /api/contests/saved`, `POST /api/contests/saved` (upsert),
  `DELETE /api/contests/saved/:contestId`.
- Raised the upcoming-contest fetch window from 10 to 30 — the dashboard's
  compact card wanted a short list, but a calendar view wants a fuller
  picture of what's scheduled.
- Frontend: reusable `CalendarGrid` (generic month-grid, not
  contest-specific — could back a future calendar feature without
  duplicating the grid logic), `ContestDayCard` (day-detail row with a
  save/unsave star), new `/contests` page merging live upcoming contests
  with saved ones so a starred contest doesn't disappear from the
  calendar just because it scrolled out of Codeforces's short
  "next N contests" window.
- Sidebar's Contests link now points to the real `/contests` page instead
  of the `/dashboard#contests` anchor placeholder from the stabilization
  phase (Dashboard's own compact contest card and countdown are unchanged
  and still there for a quick glance).

### Verified
- Backend syntax check, full boot check, route mounting confirmed.
- ESLint clean apart from one new instance of the same pre-documented
  fetch-on-mount finding (see `NOTES.md`) — no new issue class introduced.
- All new lucide-react icons (`ChevronLeft`, `ChevronRight`, `Star`)
  checked directly against the installed package version before use, per
  the lesson from the earlier `Github` icon incident.

---

## [Unreleased] — Fix: lucide-react brand icon removal (runtime error)

### Fixed
- `Sidebar.jsx` imported `Github` from `lucide-react`, which crashed at
  runtime (`does not provide an export named 'Github'`) once
  `npm install` pulled `lucide-react@^1.25.0` as pinned in
  `package.json` — Lucide 1.0 removed all brand/logo icons (GitHub,
  Twitter, Facebook, etc.) entirely for licensing reasons, so this
  wasn't a broken install, it was a real incompatibility between my
  Sidebar rewrite and the icon set actually available at that version.
  Replaced with a small inline SVG for the GitHub mark, which won't
  break again regardless of future lucide-react changes. Confirmed
  (via grep) this was the only brand-icon usage anywhere in the app.

---

## [Unreleased] — Final Project Audit (pre-Phase 3)

### Fixed (security)
- **NoSQL-injection auth bypass**: `validateLogin` only checked truthiness
  of `email`/`password`, so an object like `{"$gt": ""}` would pass
  validation and reach `User.findOne({ email })` as a raw Mongo query
  operator. All three auth validators now require actual strings.
- **Wide-open CORS**: `cors()` had no origin restriction. Restricted to a
  configurable `CLIENT_URL` env var (defaults to the Vite dev port).
- **Orphaned data on account deletion**: `deleteAccount` cleaned up `Goal`
  but left `XpHistory`/`UserAchievement`/`Activity` records behind under a
  userId that no longer existed. Now cleans up all four.

### Fixed (code quality)
- Consolidated the three near-identical account-linking endpoints
  (Codeforces/LeetCode/GitHub) in `authController` into one shared
  `updateLinkedAccountField` helper — this also fixed a real drift bug:
  GitHub linking used `find` + mutate + `save` instead of
  `findByIdAndUpdate` like the other two, and its response was missing
  `user` entirely.
- Removed 3 redundant inline `require()` re-declarations shadowing
  already-imported modules in `authController`.
- Fixed a Mongoose deprecation warning (`findOneAndUpdate`'s `new` option
  → `returnDocument: "after"`); confirmed via direct test that
  `findByIdAndUpdate` elsewhere is unaffected by this specific deprecation
  and needed no change.
- Renamed `pages/Analytics` → `pages/analytics` and `pages/Goals` →
  `pages/goals` for naming consistency with the other 5 page folders.

### Verified
- No unused files (frontend or backend) — scanned for zero-reference files.
- No unused imports — ESLint's `no-unused-vars` already covers this and
  is clean.
- Folder structure matches the requested clean architecture on both sides.
- Full ESLint + backend syntax/boot check after every fix above.

### Documented, not changed
- A pre-existing API response-shape inconsistency (some endpoints return
  the model directly, others wrap it in `{message, ...}`) — flagged in
  `NOTES.md` rather than risking a broad rewrite of every frontend
  consumer for a cosmetic win.
- Login/Register pages don't yet have dark-mode styling (render outside
  `PageLayout`) — minor, documented in `NOTES.md`.

---

## [Unreleased] — Foundation: Automatic Goal Reset

### Added
- `models/ResetMeta.js` — tracks last-run timestamps for each reset job,
  enabling a startup catch-up check instead of silently skipping a reset
  missed while the server was offline.
- `services/goalResetService.js` — `resetDaily`/`resetWeekly`/
  `resetMonthly` (each touches only its one completion counter on `Goal`,
  never targets, never anything on `User`/`XpHistory`/`UserAchievement`)
  and `runCatchUp` (compares last-run timestamps against UTC day/
  ISO-week/month boundaries).
- `jobs/goalResetJobs.js` — schedules the three resets via `node-cron`
  (`0 0 * * *` / `0 0 * * 1` / `0 0 1 * *`, all UTC), independent of any
  user request — a user who never logs in still gets reset.
- `node-cron` added to `server/package.json` dependencies.

### Verified
- All new files pass syntax check; server boots cleanly with jobs
  registering.
- UTC day/ISO-week/month boundary math tested standalone against known
  dates, including week/month/year rollovers (see `NOTES.md`).
- Confirmed via grep that the reset service never references
  `User`/`XpHistory`/`UserAchievement` — XP, streaks, and achievements are
  provably untouched by this feature.
- Full integration against a live MongoDB could not be run in this
  sandbox (no network, no local MongoDB) — see `NOTES.md`.

### Known limitation
- Multiple concurrent server instances would each run their own cron
  schedule and startup catch-up. Resets are idempotent (setting a counter
  to 0 twice has no different effect than once), so this is redundant
  rather than incorrect, but a real multi-instance deployment would want
  a job lock / leader election so only one instance runs each job.

---

## [Unreleased] — Phase 2: Contest Improvements (closes out Phase 2)

### Added
- One-time toast reminder when an upcoming contest starts within 15 minutes
  (tracked per contest ID so it doesn't repeat every second while in that
  window).
- Loading skeleton and a real error state with retry for
  `UpcomingContests` (previously had neither — a failed fetch just showed
  "No upcoming contests.", indistinguishable from a genuinely empty list).
- Dark mode support and a visual highlight for contests starting soon.

### Verified
- The live countdown timer was already implemented before Phase 2 started;
  confirmed still working after the surrounding rewrite.

---

## [Unreleased] — Phase 2: Streak System

### Added
- `models/Activity.js` — one row per user per active day; single source of
  truth for streaks and the calendar, replacing the ad-hoc day-diff counter
  `streakService.js` started with in the XP phase (extended in place, not
  duplicated).
- `streakService.computeStreaks` — current, longest, weekly, and monthly
  streaks plus a 90-day calendar, all derived from `Activity`.
- `streakService.updateStreakFields` — records today's activity and
  persists recomputed streak fields onto `User` (via an atomic `$max` for
  longest streak, so history predating `Activity` isn't lost).
- `User.weeklyStreak` / `User.monthlyStreak` fields.
- `GET /api/streak` — read-only streak status + calendar.
- Streaks now also update on logged goal progress, not just login — so a
  problem solved later in the day counts as that day's activity even
  without a fresh login.
- Frontend: `api/streak.js`, `StreakCalendar` (heatmap), `StreakCard`
  extended with weekly/monthly numbers and dark mode.

### Changed
- `authController.login` now calls `streakService` instead of inlining the
  day-diff math directly.

---

## [Unreleased] — Phase 2: Achievements

### Added
- `models/UserAchievement.js` — unlock-event records, unique per (user, key).
- `services/achievementDefinitions.js` — catalog of 8 achievements (account
  linking, streaks, levels, daily goal) each with a real `evaluate()` rule
  against actual user/goal/level state — no fabricated criteria.
- `services/achievementService.js` — `checkAndUnlock` (idempotent unlock
  engine) and `getAchievementStatus` (full catalog with progress).
- `GET /api/achievements`.
- Achievement checks wired into login, all three account-linking endpoints,
  and goal-progress logging — anywhere the underlying state they depend on
  can actually change.
- Frontend: `api/achievements.js`, reusable `AchievementBadge` and
  `AchievementsGrid` components, `utils/notifyAchievements.js` (shared
  unlock-toast helper used by Login, Goals, and Dashboard's account-link
  handlers instead of duplicating toast logic per call site).
- Dashboard now shows the achievements grid alongside XP.

---

## [Unreleased] — Phase 2: XP System

### Added
- `models/XpHistory.js` — per-user XP event log.
- `User.xp` field.
- `services/xpService.js` — `calculateLevel` (triangular XP curve: level *n*
  costs `100 * n` more XP than the last), `awardXp`, `getXpStatus`.
- `services/streakService.js` — login-streak day-diff logic extracted out of
  `authController` so it can report "is this a new day" to gate one-time
  daily rewards. (Minimal for now; extended with weekly/monthly tracking
  and the activity calendar in the Streak System phase below, not
  duplicated.)
- `GET /api/xp` — level, progress, and recent XP history.
- `POST /api/goals/progress` — logs a solved problem (bumps
  daily/weekly/monthly goal counters, which previously had no way to be
  incremented at all) and awards 5 XP.
- Daily login now awards 10 XP once per calendar day (not per login).
- Frontend: reusable `ui/ProgressBar`, `dashboard/XpCard`, `api/xp.js`.
- Dashboard shows the XP card; Goals page has a "log a problem solved"
  action; Login shows a toast for daily-login XP or a level-up celebration.

### Changed
- `authController.login` no longer inlines the streak day-diff calculation —
  delegates to `streakService.updateLoginStreak`.

---

## [Unreleased] — Phase 1

### Added
- `NOTES.md` documenting sandbox-specific verification limitations.
- Backend: `services/leetcodeService.js` — shared LeetCode GraphQL fetcher
  used by both `leetcodeController` and `analyticsController`.
- Backend: `validators/authValidator.js` — input validation for register,
  login, and password change.
- Backend: centralized 404 handler and error-handling middleware in `server.js`.
- Backend: `PUT /api/auth/profile` (name), `PUT /api/auth/password`,
  `DELETE /api/auth/account` endpoints.
- Frontend: reusable `PageLayout`, `ErrorState`, `Skeleton`/`CardSkeleton`/
  `DashboardSkeleton`, and `LinkedAccountsForm` components, removing
  duplicated Navbar/Sidebar/loading/error markup from every page.
- Frontend: `ThemeContext` + `useTheme` hook — class-based dark mode via a
  Tailwind v4 `@custom-variant`, toggle persisted to `localStorage`.
- Profile page is now fully functional: edit display name, upload an avatar
  (stored in `localStorage` for now, per explicit instruction — not yet
  synced across devices/browsers), and manage linked accounts via the
  shared `LinkedAccountsForm`.
- Settings page is now fully functional: theme toggle, change password,
  delete account (with confirmation step), and a session info panel
  (decoded JWT issued/expiry times — no fabricated multi-device session list).

### Fixed
- `analyticsController` made a hardcoded self-referential HTTP call to
  `http://localhost:8000/api/leetcode/...` — replaced with a direct call
  to the shared LeetCode service.
- The Analytics "LeetCode Difficulty" pie chart has been silently rendering
  all zeros: `analyticsController` was forwarding the raw LeetCode GraphQL
  response instead of the flat `easySolved/mediumSolved/hardSolved` shape
  `DifficultyChart.jsx` and `OverviewCards.jsx` actually read. Fixed.

### Changed
- `Dashboard.jsx`, `Analytics.jsx`, `Goals.jsx`, `Profile.jsx`, `Settings.jsx`
  now share one `PageLayout` — Navbar/Sidebar remain visible during loading
  and error states instead of disappearing (previous behavior returned
  early, before the layout render).

---

## [Unreleased] — Stabilization

### Fixed
- **Critical:** `server/routes/githubRoutes.js` was wired to `goalController`
  instead of `githubController`/`githubRepoController` — the GitHub
  integration was completely non-functional end to end. Fixed.
- Sidebar rendered 5 decorative, non-navigating `<div>`s alongside 2 working
  links. Replaced with 8 fully working `NavLink`s (Dashboard, Codeforces,
  LeetCode, GitHub, Analytics, Goals, Contests, Profile, Settings) with
  active-state styling.
- Every `alert()` call (Dashboard, Goals) replaced with `react-hot-toast`.
- Analytics and Goals pages hung on an infinite "Loading..." state if their
  API call failed; both now show a real error state with a retry action.
- `codeforces.js`, `rating.js`, and `leetcode.js` API modules bypassed the
  shared axios instance with hardcoded base URLs, silently losing the
  auth-token interceptor. Standardized on the shared instance.
- Removed a redundant manually-attached auth header in `api/auth.js`.
- Fixed function-declared-after-use and impure `Date.now()`-in-`useState`
  lint errors in `Dashboard.jsx` and `UpcomingContests.jsx`.
- Added a catch-all route so unknown paths redirect instead of showing a
  blank screen.

### Removed
- Dead/empty files: `hooks/useAuth.js`, `sevices/authService.js`,
  `components/dashboard/StatsOverview.jsx` (unused duplicate),
  `components/dashboard/LeetCodeAnalytics.jsx` (empty), `utils/constants.js`
  (empty), `server/controllers/leetcodeAnalyticsController.js` (orphaned,
  never routed).
- Assorted empty scaffold directories.

### Added
- `TASK.md` and `CHANGELOG.md` at project root.
- Profile page (`/profile`) — displays real linked-account and streak data.
- Settings page (`/settings`) — placeholder pending password/theme/delete-account work.
