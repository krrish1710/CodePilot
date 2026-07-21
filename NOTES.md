# Notes on verification in this environment

A couple of things couldn't be fully verified while working in this sandbox —
flagging them explicitly rather than silently claiming full green checks.

## `vite build` fails on a missing native binary
This sandbox's `node_modules/rolldown` is missing a platform-specific native
binding (`binding-*.mjs` fails to resolve), and there's no network access
here to fetch the correct one. This is an environment issue, not a code
issue. **Run `npm install` on your own machine** (or in CI) before trusting
this specific failure — it's very likely to disappear there. In place of a
full build, all files were verified with `node --check` (backend) and
`eslint` (frontend), which parses and type-checks imports/JSX without
needing the native bundler.

## MongoDB connectivity unverified
This sandbox has no network access at all, so the backend was verified up to
the point of binding and listening on its port — the actual `mongoose.connect()`
call to your MongoDB URI could not be exercised. Please verify the backend
against a real MongoDB instance before deploying.

## Goal reset system: no live MongoDB to test against
Same root cause as above (no network in this sandbox) — there's no local
MongoDB or `mongodb-memory-server` available either, so `Goal.updateMany()`
against a real database couldn't be exercised end-to-end. What *was*
verified: syntax check on every new file, a full server boot with the
cron jobs registering successfully, and the UTC day/ISO-week/month
boundary math tested standalone against known dates (including
week/month/year rollovers). A local `node-cron` stand-in was used only to
prove the require/wiring is correct in this sandbox (`node_modules` is
gitignored, so it's not part of what gets committed) — the real
`node-cron` package is declared in `server/package.json` and needs
`npm install` to actually be pulled in. Please run the reset jobs against
a real database (or at least call `resetDaily`/`resetWeekly`/
`resetMonthly` manually once) before relying on this in production.

## Known, intentionally-unfixed API inconsistency
Some endpoints return the model directly (`GET /api/goals` returns the
`Goal` doc as-is), others wrap it in `{ message, ... }` (auth endpoints).
Found during the pre-Phase-3 audit but not unified — every frontend
consumer is coded against these specific shapes already, so a global
rewrite right now would be a lot of churn for a cosmetic consistency win.
Worth doing as its own deliberate pass (ideally alongside API versioning)
rather than folded into an audit that's meant to stabilize, not reshape.

## Known, intentionally-unfixed cosmetic gap
Login/Register pages don't have dark-mode styling (they render outside
`PageLayout`, unlike every authenticated page). The theme toggle still
applies globally, so these two pages just look unstyled-for-dark rather
than broken. Minor, and lower priority than the security/data fixes made
during the audit — flagging it here rather than silently leaving it
unmentioned.

## Contest reminders / goal reminders / notification persistence: no live MongoDB
Same root cause as the goal-reset and audit notes above. What *was*
verified for this round: syntax check on every new/changed file, a full
server boot with both cron job sets (`goalResetJobs` and the new
`reminderJobs`) registering successfully, route mounting, and the
countdown-timer math tested standalone against known time deltas
(including boundary cases like exactly-24h and just-under-an-hour). The
goal-completion "only notify on the crossing, not every subsequent log"
logic and the contest-reminder 30-minute window check were verified by
code review (both are simple, direct boolean/arithmetic conditions) but
not exercised against a real database. Please verify notification
creation and the reminder jobs against a real MongoDB instance before
relying on them in production.

## Known ESLint findings (non-functional)
`Dashboard.jsx` and `UpcomingContests.jsx` trip the experimental
`react-hooks/set-state-in-effect` rule (part of the React Compiler preview
ruleset) for the standard "fetch data in a `useEffect` on mount" pattern —
the same pattern used throughout the rest of the app (Analytics, Goals,
Profile all do this too; those didn't happen to trip the rule in this pass).
This is not a runtime bug — it's completely standard, safe React code.
Silencing it for real means moving data-fetching to a library like React
Query or SWR, which is a real architectural change worth doing deliberately
in its own phase, not as an incidental fix.
