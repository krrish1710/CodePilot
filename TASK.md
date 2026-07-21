# CodePilot — Task List

## Stabilization
- [x] Remove dead code and empty files
- [x] Fix Sidebar (real navigation to all 8 sections)
- [x] Logout with JWT/localStorage cleanup (verified pre-existing implementation)
- [x] Replace every alert() with react-hot-toast
- [x] Add loading and error states (Dashboard, Analytics, Goals)
- [x] Standardize frontend API layer (codeforces.js, rating.js, leetcode.js)
- [x] Fix critical bug: githubRoutes.js wired to wrong controller
- [x] Remove duplicate/orphaned components (StatsOverview, LeetCodeAnalytics, leetcodeAnalyticsController)
- [x] Fix broken hook-order / impure-state lint errors (Dashboard, UpcomingContests)
- [x] Verify frontend builds — ESLint passes with 2 known, non-functional
      findings (see NOTES.md); `vite build` itself is blocked by a missing
      native binary in this sandbox (no network to fetch it), not a code issue
- [x] Verify backend starts successfully (HTTP server binds and listens;
      MongoDB connectivity itself unverifiable — no network in this sandbox)
- [x] Remove remaining duplicate code (extracted shared leetcodeService,
      shared LinkedAccountsForm component)
- [x] Standardize folder structure (added server/services/, server/validators/)
- [x] Replace remaining hardcoded API calls (analyticsController no longer
      makes a self-referential HTTP call to localhost:8000)
- [x] Ensure every page has loading, empty, and error states
- [x] Add reusable UI components (PageLayout, ErrorState, Skeleton, LinkedAccountsForm)

## Phase 1 — Profile (complete)
- [x] Edit profile (name)
- [x] Change linked accounts (shared LinkedAccountsForm, used by Dashboard and Profile)
- [x] Upload avatar (stored in browser localStorage, per instruction)

## Phase 1 — Settings
- [x] Theme toggle (dark mode, class-based via Tailwind v4 custom variant)
- [x] Change password
- [x] Delete account
- [x] Session info panel (decoded JWT issued/expiry — honest about no
      multi-device session tracking existing yet)

## Phase 1 — Dashboard polish
- [x] Reusable cards (via Skeleton/CardSkeleton, ErrorState)
- [x] Responsive improvements (dark-mode-aware, existing responsive grid retained)
- [x] Skeleton loading (Dashboard, Analytics, Goals, Profile)

## Final Project Audit (pre-Phase 3)
- [x] Duplicate code — consolidated the three near-identical account-linking
      endpoints (Codeforces/LeetCode/GitHub) into one shared helper; removed
      3 redundant inline `require()` re-declarations in authController
- [x] Unused files — scanned frontend and backend for files with zero
      references elsewhere; none found
- [x] Unused imports — covered by ESLint's `no-unused-vars` (already clean)
- [x] Inconsistent naming — renamed `pages/Analytics` → `pages/analytics`
      and `pages/Goals` → `pages/goals` to match the other 5 page folders
- [x] Security issues:
      - Fixed a real NoSQL-injection auth-bypass gap: `validateLogin`
        didn't enforce `email`/`password` were strings, so a truthy object
        like `{"$gt": ""}` would reach `User.findOne({ email })` as a raw
        Mongo operator. Fixed across all three auth validators.
      - CORS was wide open (`cors()`, no origin restriction) — restricted
        to a configurable `CLIENT_URL` env var.
      - `deleteAccount` left orphaned `XpHistory`/`UserAchievement`/
        `Activity` records behind — now cleans up all per-user collections.
- [x] API consistency — GitHub linking used find+mutate+save while
      Codeforces/LeetCode used `findByIdAndUpdate`, and GitHub's response
      was missing `user`. Fixed by the duplicate-code consolidation above.
      (Known, intentionally-not-fixed inconsistency: some endpoints return
      the model directly, others wrap it in `{message, ...}` — rewriting
      this now would touch many frontend consumers for a cosmetic win; see
      NOTES.md.)
- [x] Folder structure — confirmed it matches the requested clean
      architecture on both sides (frontend: api/components/context/pages/
      routes/utils; backend: config/controllers/jobs/middlewares/models/
      routes/services/validators)
- [x] Fixed a Mongoose deprecation warning (`findOneAndUpdate` `new` option
      → `returnDocument`); confirmed via direct test that `findByIdAndUpdate`
      elsewhere is unaffected by this specific deprecation


- [x] Daily reset (dailyCompleted → 0, every day at 00:00 UTC)
- [x] Weekly reset (weeklyCompleted → 0, every Monday at 00:00 UTC)
- [x] Monthly reset (monthlyCompleted → 0, 1st of month at 00:00 UTC)
- [x] Independent of login — runs via node-cron background job, not
      gated on any request
- [x] Startup catch-up — `ResetMeta` tracks last-run timestamps so a
      reset missed while the server was offline runs immediately on boot
      instead of waiting for the next scheduled tick
- [x] XP, streaks, and achievements confirmed untouched (grepped
      goalResetService/goalResetJobs for any User/XpHistory/
      UserAchievement reference — only `Goal.dailyCompleted` /
      `weeklyCompleted` / `monthlyCompleted` are ever written)
- [x] Date-boundary math (UTC day/ISO-week/month-start) verified against
      known dates including week/month/year rollovers
- [ ] Full end-to-end verification against a live MongoDB — not possible
      in this sandbox (no network, no local MongoDB); verified via syntax
      check, boot check, and isolated date-math tests instead. See
      NOTES.md.


- [x] XP model (`XpHistory`)
- [x] XP history (per-user event log, exposed via `/api/xp`)
- [x] Level calculation (`xpService.calculateLevel`, triangular curve)
- [x] Progress bar (reusable `ui/ProgressBar`)
- [x] XP service (`services/xpService.js` — calculateLevel, awardXp, getXpStatus)
- [x] Backend APIs (`GET /api/xp`; XP also awarded via login and
      `POST /api/goals/progress`)
- [x] Dashboard integration (`XpCard`, level-up toasts on Login and Goals)

## Phase 2 — Achievements
- [x] Achievement model (`UserAchievement`)
- [x] Auto unlock engine (`achievementService.checkAndUnlock`, idempotent
      via unique (user, key) index)
- [x] Achievement service (definitions catalog + service)
- [x] Badge UI (`AchievementBadge`, locked/unlocked states)
- [x] Achievement progress (per-achievement progress bar for locked items)
- [x] Dashboard integration (`AchievementsGrid`, unlock toasts on login,
      account linking, and goal-progress logging)

## Phase 2 — Streak System
- [x] Improve login streak logic (now backed by an Activity collection
      instead of an ad-hoc day-diff counter)
- [x] Weekly streak
- [x] Monthly streak
- [x] Streak calendar (90-day heatmap)
- [x] Auto updates (streaks recompute on login AND on logged goal progress,
      not just login)

## Phase 2 — Contest Improvements
- [x] Contest reminders (one-time toast when a contest is within 15 minutes)
- [x] Countdown (was already implemented pre-Phase 2; verified working)
- [x] Better contest cards (loading/error states, dark mode, "starting soon"
      highlight)

## Phase 3
- [x] Contest Calendar
      - [x] Backend: `SavedContest` model, save/unsave/list endpoints
            (`GET/POST /api/contests/saved`, `DELETE /api/contests/saved/:id`)
      - [x] Backend: raised the upcoming-contest fetch window for a
            calendar view (was capped at 10 for the dashboard card)
      - [x] Frontend: reusable `CalendarGrid` month view, `ContestDayCard`
            with save/unsave star toggle, `/contests` page
      - [x] Route wired (`/contests`), Sidebar's Contests link now points
            to the real page instead of the old dashboard-anchor
            placeholder from the stabilization phase
      - [x] Verified: imports, routes, backend syntax/boot, ESLint (one
            new instance of the same pre-documented fetch-on-mount lint
            finding — see NOTES.md — no new issues)
- [x] Notifications
      - [x] Backend: `Notification` model, `notificationService`
            (single creation path reused by XP and achievement services
            rather than each caller building its own document)
      - [x] Backend: level-ups (`xpService.awardXp`) and achievement
            unlocks (`achievementService.checkAndUnlock`) now create a
            durable notification alongside the existing toast, so it
            survives being missed/dismissed and shows up in history
      - [x] `GET /api/notifications`, `GET /api/notifications/unread-count`,
            `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`
      - [x] Frontend: `NotificationBell` in the Navbar — unread badge,
            dropdown panel, mark-one/mark-all read, 60s unread-count polling
      - [x] Verified: imports, routes, backend syntax/boot, ESLint (one
            new instance of the pre-documented fetch-on-mount finding),
            new icons (`Bell`, `Check`, `CheckCheck`) checked directly
            against the installed package
- [x] Advanced analytics
      - [x] Backend: `advancedAnalyticsService` — XP growth trend (30-day
            cumulative), problems-solved-per-week productivity trend, and
            an all-time weekday activity breakdown, all derived from data
            already tracked (`XpHistory`, `Activity`) rather than
            duplicating the existing external-API analytics
      - [x] `GET /api/analytics/advanced`
      - [x] Frontend: `XpTrendChart`, `ProductivityTrendChart`,
            `WeekdayBreakdownChart`, wired into the Analytics page as an
            independently-loaded section (doesn't block or get blocked by
            the existing linked-account analytics)
      - [x] Verified: imports, routes, backend syntax/boot, ESLint (no
            new findings beyond the 4 pre-documented instances)
- [x] AI Coding Coach
      - [x] Backend: `services/aiCoachService.js`, `controllers/aiCoachController.js`,
            `routes/aiCoachRoutes.js` — no external LLM API used
      - [x] Extracted `services/profileAnalyticsService.js` out of
            `analyticsController` (was inline CF/GitHub/LeetCode fetch
            logic) so the Coach reuses it instead of duplicating it;
            `analyticsController.getAnalytics` is now a thin wrapper
      - [x] Architecture: `gatherCoachingContext(userId)` reuses
            `profileAnalyticsService`, `streakService`, `xpService`, and
            `advancedAnalyticsService` — no analytics logic duplicated.
            `generateRecommendations` runs 7 independent, pure rule
            functions over that context, each returning the same
            `{ id, category, title, message, priority }` shape a future
            LLM-based version would also return — swapping to a real LLM
            later only touches this one file (prompt-build from the same
            context + parse the response into that shape); controller,
            routes, and frontend contract stay identical
      - [x] Categories implemented: weak areas (difficulty ratio + contest
            reps, not fabricated topic-tag data we don't track), suggested
            daily target (from actual weekly throughput), contest prep
            (rating trend), consistency warnings (streak vs personal
            best), XP optimization (passive vs earned XP ratio), goal
            completion advice, motivational insight (always returns
            something)
      - [x] `GET /api/coach`
      - [x] Frontend: `pages/coach/Coach.jsx`, reusable `CoachCard`,
            `api/coach.js`; wired into Sidebar + routes
      - [x] Verified: imports, routes, backend syntax/boot, ESLint (one
            new instance of the pre-documented fetch-on-mount finding —
            now 5 total, no new issue class), new icons checked directly
            against the installed package
## Phase 3 — Contest Calendar & Notifications extensions
(Both features already existed from earlier Phase 3 work; this pass
audited them against a more detailed spec and filled the real gaps
rather than rebuilding.)
- [x] Contest Calendar: show contest duration (was missing from the
      dedicated page's contest cards — the dashboard's compact card had
      it, the calendar page's card didn't)
- [x] Contest Calendar: explicit "(your local time)" label on start times
      (was already using the browser's local timezone via
      `toLocaleString()`, just not labeled as such)
- [x] Contest Calendar: added a "Next Up" agenda section sorted
      nearest-first, shown by default — previously contests only appeared
      after clicking a specific calendar day
- [x] Notifications: extracted `contestService.fetchUpcomingCFContests`
      out of `contestController` so the new reminder job reuses it
      instead of duplicating the Codeforces fetch
- [x] Notifications: added `contest_reminder`, `daily_goal_reminder`,
      `weekly_goal_reminder`, `goal_completed` to the type enum (was
      `achievement`/`level_up` only)
- [x] Notifications: `services/reminderService.js` +
      `jobs/reminderJobs.js` — contest-starting-soon (tied to
      `SavedContest`, not spammed to everyone for every contest),
      daily goal reminder (once/day, 20:00 UTC), weekly goal reminder
      (Saturday 20:00 UTC) — all background cron jobs, not
      login-triggered
- [x] Notifications: `SavedContest.reminderSent` flag prevents duplicate
      contest reminders
- [x] Notifications: "goal completed" notification fires exactly once per
      crossing (daily/weekly/monthly independently) in `goalController.logProgress`
- [x] Notifications: `DELETE /api/notifications/:id` + delete button in
      the panel (was mark-read only, no delete)
- [x] Notifications: responsive panel width (`max-w-[calc(100vw-2rem)]`,
      was a fixed `w-80` that could overflow narrow viewports)
- [x] Verified: imports, routes, backend syntax/boot (both job sets
      registering), MongoDB (schema/logic review only — see NOTES.md for
      why full integration testing isn't possible in this sandbox),
      countdown-timer math tested standalone against known deltas
      including boundary cases, ESLint (same 5 pre-documented findings,
      no new issue class), new icon (`Trash2`) checked against the
      installed package

- [ ] Resume Builder (skipped for now, per instruction)
- [ ] Public Portfolio

## Goal System Refactor — automatic progress tracking
- [x] Removed manual problem-completion input: `POST /api/goals/progress`
      (the "I solved a problem today" button) is gone. Problem-solving
      goal progress can no longer be hand-logged.
- [x] Backend: `services/codeforcesService.js` — new, consolidates every
      Codeforces API call (`fetchUserInfo`, `fetchRatingHistory`, and a
      new `fetchUserSubmissions`). `codeforcesController` and
      `profileAnalyticsService` were duplicating the same `user.info`/
      `user.rating` axios calls independently; both now call through this
      one service instead.
- [x] Backend: `services/leetcodeService.js` — added
      `fetchRecentAcSubmissions` (GraphQL `recentAcSubmissionList`),
      reusing the existing shared LeetCode GraphQL client rather than a
      second one.
- [x] Backend: `models/SolvedProblem.js` — new ledger of solved problems
      detected from linked accounts (`user`, `source`, `problemKey`,
      `solvedAt`), unique-indexed on `(user, source, problemKey)` so a
      problem is only ever counted/XP-awarded once no matter how many
      times it's re-fetched.
- [x] Backend: `services/goalProgressService.js` — the new core.
      `refreshGoalProgress(userId)`:
      1. Fetches Codeforces submissions + LeetCode recent accepted
         submissions (exactly one call to each linked account per sync —
         no duplicate API calls).
      2. Dedupes to the earliest accepted timestamp per problem, persists
         any not already in `SolvedProblem`.
      3. Awards XP (and records streak activity) only for problems solved
         **today** — not for every newly-inserted row — so a user's first
         sync doesn't retroactively hand out XP for years of Codeforces
         history. Older solves are still recorded (so weekly/monthly
         counts stay accurate), just without XP/streak side effects.
      4. Recomputes `dailyCompleted`/`weeklyCompleted`/`monthlyCompleted`
         from the `SolvedProblem` ledger using the same UTC day/ISO-week/
         month boundaries as `goalResetService` (extracted to
         `utils/dateWindows.js` so both share one definition), and caches
         them onto the `Goal` document.
      5. Fires the same "goal completed" notifications the old manual
         endpoint used to, on crossing (daily/weekly/monthly
         independently), moved here since this is where completion counts
         actually change now.
- [x] Backend: `Goal` model — `dailyCompleted`/`weeklyCompleted`/
      `monthlyCompleted` are now a synced cache, not manually incremented
      fields. Added `lastSyncedAt`. Added `manualGoals` (subdocument
      array: `label`, `target`, `completed`) for goals that genuinely
      can't be fetched automatically — revision sessions, study hours,
      etc.
- [x] Backend: `goalController.getGoals` syncs automatically on every
      call (Dashboard/Goals page load, or the frontend's 60s poll) instead
      of requiring a manual log action; also runs achievement checks so
      unlocks tied to goal progress still fire without a manual trigger.
      Added `addManualGoal`/`updateManualGoalProgress`/`deleteManualGoal`
      for the manual-only goal type.
- [x] Backend: `routes/goalRoutes.js` — removed `POST /goals/progress`;
      added `POST /goals/manual`, `PUT /goals/manual/:id`,
      `DELETE /goals/manual/:id`.
- [x] Backend: `reminderService.checkDailyGoalReminders` /
      `checkWeeklyGoalReminders` now call `goalProgressService` to sync
      each candidate before checking their threshold, instead of reading
      the `Goal.dailyCompleted`/`weeklyCompleted` cache as-is — a user who
      hasn't opened the app that day would otherwise be evaluated against
      a stale number.
- [x] Backend: `authController.deleteAccount` now also cleans up
      `SolvedProblem` records (new per-user collection).
- [x] XP: kept working — `xpService.awardXp`/`getXpStatus` untouched;
      solved-problem XP now originates from `goalProgressService` instead
      of the removed manual endpoint, using the same
      `"Logged a problem solved"` reason string so
      `advancedAnalyticsService.getProductivityTrend`'s existing
      `XpHistory` filter keeps matching without modification.
- [x] Achievements: kept working — `achievementDefinitions`'s
      `goal_crusher` still reads `Goal.dailyCompleted`/`dailyTarget`
      directly and needed no changes, since those fields are still real,
      just synced automatically now instead of manually incremented.
- [x] Frontend: `api/goals.js` — replaced `logGoalProgress` with
      `addManualGoal`/`updateManualGoalProgress`/`deleteManualGoal`.
- [x] Frontend: `components/dashboard/GoalCard.jsx` — dark-mode support,
      optional "Auto" subtitle badge.
- [x] Frontend: `pages/goals/Goals.jsx` — removed the manual "I solved a
      problem" button; added a "synced Xm ago" indicator, 60s background
      auto-refresh (same pattern `NotificationBell` already used for
      unread-count polling), and a Manual Goals section (add/+1/remove).
- [x] Frontend: `pages/dashboard/Dashboard.jsx` — added a live Goals
      summary section (daily/weekly/monthly `GoalCard`s + a link to the
      full Goals page). This didn't exist on the Dashboard before this
      refactor. Same 60s polling pattern as the Goals page.
- [x] Verified: backend — every file under `server/` (recursively)
      passes `node -c` syntax checking, including all new/modified files;
      manually reviewed the CF-submission and LeetCode-AC-submission
      normalization logic and the crossing-notification logic for
      correctness. Frontend — reviewed `Dashboard.jsx`/`Goals.jsx` for
      hook order, prop shapes, and JSX balance; confirmed no remaining
      references to the removed `logGoalProgress`/`POST /goals/progress`
      anywhere in `client/` or `server/`.
- [ ] `npm install`/`vite build`/ESLint could not be run in this sandbox
      (no network access — same pre-existing limitation documented
      above). MongoDB integration (confirming `SolvedProblem` upserts,
      the unique-index race handling, and live CF/LeetCode API responses
      against the real schemas) could not be verified either, for the
      same reason.

## Known limitations (see NOTES.md for detail)
- [ ] 5 files (Dashboard.jsx, UpcomingContests.jsx, Coach.jsx, Contests.jsx,
      NotificationBell.jsx) still trip the experimental
      `react-hooks/set-state-in-effect` rule for the standard "fetch on mount"
      pattern. Not a runtime bug; fixing it for real means adopting a
      data-fetching library (React Query/SWR) — a real architectural change,
      not something to do silently.
- [ ] `vite build` cannot be verified in this sandbox (missing native binary,
      no network access to fetch it).
- [ ] MongoDB connectivity cannot be verified in this sandbox (no network access).
