// Small date utilities shared across the app.
// Keeping these framework-agnostic (plain functions, no React) makes them
// easy to unit test on their own.

export function formatDateMobile(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatDateToInput(date) {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [year, month, day].join("-");
}

export function isDateSkipped(dateObj, globalSkippedDates) {
  return globalSkippedDates.includes(formatDateToInput(dateObj));
}
