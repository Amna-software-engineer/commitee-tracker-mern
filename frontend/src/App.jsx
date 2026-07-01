import { useMemo, useState, useEffect, useCallback } from "react";
import { buildCommittees } from "./utils/committeeEngine";
import { DEFAULT_START_DATE, DURATION, DAILY_AMOUNT, TOTAL_COMMITTEES_TARGET, ROWS_PER_PAGE, TOTAL_POOL_MAX } from "./constants";

import { fetchCommittees, patchCommittee, deleteCommitteeNote, toggleChecklistDay as toggleChecklistDayApi } from "./api/committees";
import { fetchMembers } from "./api/members";
import { fetchSkippedDates, addSkippedDate, removeSkippedDate } from "./api/skippedDates";

import StatsPanel from "./components/StatsPanel";
import Checklist from "./components/Checklist";
import CommitteeTable from "./components/CommitteeTable";
import Pagination from "./components/Pagination";

export default function App() {
  // "today" is computed once when the app loads, same as the original
  // script's `const today = new Date()` inside DOMContentLoaded.
  const [today] = useState(() => new Date());

  // ---- Server-backed state ----
  // These mirror what used to live in localStorage, except now they're
  // loaded from - and written back to - the Express/Mongo API.
  const [committees, setCommittees] = useState([]); // raw docs from GET /api/committees
  const [members, setMembers] = useState([]); // raw docs from GET /api/members
  const [globalSkippedDates, setGlobalSkippedDates] = useState([]); // ["YYYY-MM-DD", ...]

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // ---- Transient UI state ----
  const [showSkippedMode, setShowSkippedMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ---- Initial load ----
  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [committeesData, membersData, skippedData] = await Promise.all([
        fetchCommittees(),
        fetchMembers(),
        fetchSkippedDates(),
      ]);
      setCommittees(committeesData);
      setMembers(membersData);
      setGlobalSkippedDates(skippedData);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Helper to splice one updated committee doc back into the committees array
  // after a successful PATCH/DELETE, without refetching the whole list.
  const applyCommitteeUpdate = (updated) => {
    setCommittees((prev) => prev.map((c) => (c.committeeNo === updated.committeeNo ? updated : c)));
  };

  // ---- Derived data (same shape the pure buildCommittees() function expects) ----
  const manualDates = useMemo(() => {
    const map = {};
    committees.forEach((c) => {
      if (c.manualStart || c.manualEnd) {
        map[c.committeeNo] = { start: c.manualStart || undefined, end: c.manualEnd || undefined };
      }
    });
    return map;
  }, [committees]);

  const savedAllocations = useMemo(() => {
    const map = {};
    committees.forEach((c) => {
      if (c.assignedTo) map[c.committeeNo] = c.assignedTo;
    });
    return map;
  }, [committees]);

  const savedNotes = useMemo(() => {
    const map = {};
    committees.forEach((c) => {
      if (c.note) map[c.committeeNo] = c.note;
    });
    return map;
  }, [committees]);

  const savedChecklists = useMemo(() => {
    const map = {};
    committees.forEach((c) => {
      map[c.committeeNo] = c.checklist;
    });
    return map;
  }, [committees]);

  const memberAvailableSlots = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      map[m.name] = m.availableSlots;
    });
    return map;
  }, [members]);

  // Recomputes the whole timeline whenever a manual date override or a
  // skipped date changes - same useMemo as before, just fed by server data now.
  const { allCommitteesData, activeCommitteeNum } = useMemo(
    () =>
      buildCommittees({
        manualDates,
        globalSkippedDates,
        defaultStartDate: DEFAULT_START_DATE,
        duration: DURATION,
        totalCommitteesTarget: TOTAL_COMMITTEES_TARGET,
        today,
      }),
    [manualDates, globalSkippedDates, today]
  );

  const currentActiveData = allCommitteesData.find((c) => c.no === activeCommitteeNum) || null;
  const checks = savedChecklists[activeCommitteeNum] || Array(DURATION).fill(false);
  const tickCount = checks.filter(Boolean).length;

  const activeElapsedDaysValid = useMemo(() => {
    if (!currentActiveData) return 0;
    const targetToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return currentActiveData.dates.filter((d) => targetToday >= new Date(d.getFullYear(), d.getMonth(), d.getDate()))
      .length;
  }, [currentActiveData, today]);

  // ---- Handlers (each now calls the API, then patches local state from the response) ----
  const handleToggleMode = () => setShowSkippedMode((v) => !v);

  const handleToggleDay = async (dayIdx) => {
    setActionError(null);
    try {
      const updated = await toggleChecklistDayApi(activeCommitteeNum, dayIdx);
      applyCommitteeUpdate(updated);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const toggleSkip = async (dateKey) => {
    setActionError(null);
    const alreadySkipped = globalSkippedDates.includes(dateKey);
    try {
      if (alreadySkipped) {
        await removeSkippedDate(dateKey);
        setGlobalSkippedDates((prev) => prev.filter((d) => d !== dateKey));
      } else {
        await addSkippedDate(dateKey);
        setGlobalSkippedDates((prev) => [...prev, dateKey].sort());
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleAssign = async (committeeNo, name) => {
    setActionError(null);
    try {
      const updated = await patchCommittee(committeeNo, { assignedTo: name });
      applyCommitteeUpdate(updated);
      // Assigning changes every member's availableSlots count, so refresh that list too.
      const freshMembers = await fetchMembers();
      setMembers(freshMembers);
    } catch (err) {
      // e.g. "Junaid has no available slots left" - the <select> already disables
      // full members, but this covers race conditions between two browser tabs.
      setActionError(err.message);
    }
  };

  const handleDateChange = async (committeeNo, field, value) => {
    setActionError(null);
    const payload = field === "start" ? { manualStart: value } : { manualEnd: value };
    try {
      const updated = await patchCommittee(committeeNo, payload);
      applyCommitteeUpdate(updated);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleNoteSave = async (committeeNo, text) => {
    setActionError(null);
    try {
      const updated = await patchCommittee(committeeNo, { note: text });
      applyCommitteeUpdate(updated);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleNoteDelete = async (committeeNo) => {
    setActionError(null);
    try {
      const updated = await deleteCommitteeNote(committeeNo);
      applyCommitteeUpdate(updated);
    } catch (err) {
      setActionError(err.message);
    }
  };

  // ---- Pagination ----
  const totalPages = Math.ceil(TOTAL_COMMITTEES_TARGET / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const pageData = allCommitteesData.slice(startIndex, startIndex + ROWS_PER_PAGE);

  if (loading) {
    return <p style={{ padding: 16, textAlign: "center", color: "#64748b" }}>Loading committee data...</p>;
  }

  if (loadError) {
    return (
      <div style={{ padding: 16 }}>
        <p style={{ color: "#dc2626", fontWeight: 600 }}>Couldn't load data: {loadError}</p>
        <button className="page-btn" onClick={loadAll}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {actionError && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#b91c1c",
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 12,
            fontSize: "0.85rem",
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span>{actionError}</span>
          <span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => setActionError(null)}>
            ✕
          </span>
        </div>
      )}

      <StatsPanel
        currentActiveData={currentActiveData}
        activeElapsedDaysValid={activeElapsedDaysValid}
        tickCount={tickCount}
        duration={DURATION}
        dailyAmount={DAILY_AMOUNT}
        totalPoolMax={TOTAL_POOL_MAX}
      />

      <Checklist
        activeCommitteeNum={activeCommitteeNum}
        currentActiveData={currentActiveData}
        checks={checks}
        duration={DURATION}
        showSkippedMode={showSkippedMode}
        globalSkippedDates={globalSkippedDates}
        onToggleMode={handleToggleMode}
        onToggleDay={handleToggleDay}
        onSkipDate={toggleSkip}
        onUndoSkip={toggleSkip}
      />

      <h3>📊 Committee Tracker Schedule</h3>
      <p className="info-tip">
        * Jis date ko skip krna chahein, box k niche "Skip Date" daba dein. Agli dates automatic agay shift ho
        jayengi.
      </p>

      <CommitteeTable
        pageData={pageData}
        savedAllocations={savedAllocations}
        savedNotes={savedNotes}
        memberAvailableSlots={memberAvailableSlots}
        onAssign={handleAssign}
        onDateChange={handleDateChange}
        onNoteSave={handleNoteSave}
        onNoteDelete={handleNoteDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />
    </>
  );
}
