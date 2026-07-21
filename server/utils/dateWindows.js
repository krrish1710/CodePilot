// UTC day/ISO-week/month boundary helpers. Previously goalResetService
// kept a private copy of this exact math; extracted here so
// goalProgressService can reuse the identical boundaries when computing
// "today"/"this week"/"this month" solved-problem counts, instead of a
// second slightly-different implementation drifting out of sync with the
// reset job's definition of those windows.

function startOfDayUTC(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function startOfIsoWeekUTC(date) {
  const d = startOfDayUTC(date);
  const day = d.getUTCDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d;
}

function startOfMonthUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

module.exports = { startOfDayUTC, startOfIsoWeekUTC, startOfMonthUTC };
