import { formatDateMobile, formatDateToInput } from "../utils/dateHelpers";

export default function Checklist({
  activeCommitteeNum,
  currentActiveData,
  checks,
  duration,
  showSkippedMode,
  globalSkippedDates,
  onToggleMode,
  onToggleDay,
  onSkipDate,
  onUndoSkip,
}) {
  const headerTitle = showSkippedMode
    ? "🗑️ Skipped Dates"
    : `📆 Cash Saved Checklist (Committee #${activeCommitteeNum})`;

  return (
    <div className="checklist-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <div className="stat-label" style={{ color: "var(--dark-text)" }}>
          {headerTitle}
        </div>
        <button
          id="toggleSkippedBtn"
          onClick={onToggleMode}
          style={{
            fontSize: "0.75rem",
            padding: "6px 10px",
            background: showSkippedMode ? "#fef08a" : "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            color: "#475569",
            marginLeft: "auto",
            transition: "all 0.2s ease",
          }}
        >
          {showSkippedMode ? "👁️ Show Active Grid" : "⚙️ Manage Skipped"}
        </button>
      </div>

      <div className="grid-boxes">
        {showSkippedMode ? (
          globalSkippedDates.length === 0 ? (
            <div
              style={{
                gridColumn: "span 4",
                fontSize: "0.85rem",
                color: "#94a3b8",
                textAlign: "center",
                padding: "20px",
              }}
            >
              Koi bhi date skip nahi hui.
            </div>
          ) : (
            globalSkippedDates.map((skippedDateKey) => (
              <div
                key={skippedDateKey}
                className="day-box"
                style={{ borderColor: "#fca5a5", background: "#fef2f2" }}
              >
                <div className="day-num" style={{ color: "#b91c1c" }}>
                  Skipped
                </div>
                <div className="day-date" style={{ color: "#ef4444" }}>
                  {formatDateMobile(new Date(skippedDateKey))}
                </div>
                <div
                  className="skip-action-btn"
                  style={{ background: "#fef08a", color: "#a16207", marginTop: "4px" }}
                  onClick={() => onUndoSkip(skippedDateKey)}
                >
                  Undo Skip
                </div>
              </div>
            ))
          )
        ) : (
          Array.from({ length: duration }).map((_, dayIdx) => {
            const isChecked = !!checks[dayIdx];
            const dayDateObj = currentActiveData ? currentActiveData.dates[dayIdx] : null;
            const dateStringDisplay = dayDateObj ? formatDateMobile(dayDateObj) : `Day ${dayIdx + 1}`;
            const rawInputDateString = dayDateObj ? formatDateToInput(dayDateObj) : "";

            return (
              <div
                key={dayIdx}
                className={`day-box ${isChecked ? "checked" : ""}`}
                onClick={(e) => {
                  // Skip-date click is handled by its own button below; don't
                  // let it also toggle the checkbox for this box.
                  if (e.target.classList.contains("skip-action-btn")) return;
                  onToggleDay(dayIdx);
                }}
              >
                <div className="day-num">Day {dayIdx + 1}</div>
                <div className="day-date">{dateStringDisplay}</div>
                <input type="checkbox" checked={isChecked} readOnly />
                {!isChecked && (
                  <div
                    className="skip-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (rawInputDateString) onSkipDate(rawInputDateString);
                    }}
                  >
                    Skip Date
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
