import { isDateSkipped } from "./dateHelpers";

/**
 * Builds the full list of committee cycles (start/end dates, status, the
 * 20-day date sequence for each one) given the current manual overrides and
 * skipped dates.
 *
 * This is a pure function — same inputs always produce the same output —
 * which is exactly why the original script.js had to `window.location.reload()`
 * any time a date changed: it needed to re-run this whole loop from scratch.
 * In React we just call this function again inside a useMemo instead.
 */
export function buildCommittees({
  manualDates,
  globalSkippedDates,
  defaultStartDate,
  duration,
  totalCommitteesTarget,
  today,
}) {
  let nextCalculatedStartDate = new Date(defaultStartDate);
  let activeCommitteeNum = null;
  const allCommitteesData = [];

  for (let committeeNo = 1; committeeNo <= totalCommitteesTarget; committeeNo++) {
    const manualStart = manualDates[committeeNo]?.start;
    let cStart = manualStart ? new Date(manualStart) : new Date(nextCalculatedStartDate);

    while (isDateSkipped(cStart, globalSkippedDates)) {
      cStart.setDate(cStart.getDate() + 1);
    }

    const dateSequence = [];
    const runningDate = new Date(cStart);
    while (dateSequence.length < duration) {
      if (!isDateSkipped(runningDate, globalSkippedDates)) {
        dateSequence.push(new Date(runningDate));
      }
      runningDate.setDate(runningDate.getDate() + 1);
    }

    const cEnd = new Date(dateSequence[dateSequence.length - 1]);
    let status = "Remaining";
    let rowStyleClass = "row-remaining";

    const targetToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const compStart = new Date(cStart.getFullYear(), cStart.getMonth(), cStart.getDate());
    const compEnd = new Date(cEnd.getFullYear(), cEnd.getMonth(), cEnd.getDate());
    const isCurrent = targetToday >= compStart && targetToday <= compEnd;

    if (isCurrent) {
      status = "ACTIVE";
      rowStyleClass = "row-active";
      activeCommitteeNum = committeeNo;
    } else if (targetToday > compEnd) {
      status = "Completed";
      rowStyleClass = "row-completed";
    }

    allCommitteesData.push({
      no: committeeNo,
      start: cStart,
      end: cEnd,
      isCurrent,
      status,
      rowStyleClass,
      allowDropdown:
        status === "Completed" ||
        (isCurrent && Math.ceil((cEnd.getTime() - today.getTime()) / (1000 * 3600 * 24)) <= 5),
      dates: dateSequence,
    });

    nextCalculatedStartDate = new Date(cEnd);
    nextCalculatedStartDate.setDate(nextCalculatedStartDate.getDate() + 1);
  }

  if (!activeCommitteeNum) activeCommitteeNum = 1;

  return { allCommitteesData, activeCommitteeNum };
}
