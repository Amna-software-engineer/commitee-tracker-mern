import EditableDate from "./EditableDate";
import EditableNote from "./EditableNote";

function AssignSelect({ committeeNo, memberAvailableSlots, onAssign }) {
  return (
    <select
      className="givenToSelect"
      defaultValue=""
      onChange={(e) => {
        if (e.target.value) onAssign(committeeNo, e.target.value);
      }}
    >
      <option value="">Select...</option>
      {Object.entries(memberAvailableSlots).map(([name, slotsLeft]) => (
        <option key={name} value={name} disabled={slotsLeft <= 0}>
          {name} ({slotsLeft})
        </option>
      ))}
    </select>
  );
}

export default function CommitteeTable({
  pageData,
  savedAllocations,
  savedNotes,
  memberAvailableSlots,
  onAssign,
  onDateChange,
  onNoteSave,
  onNoteDelete,
}) {
  return (
    <div className="table-responsive-wrapper">
      <table id="mobileCommitteeTable">
        <thead>
          <tr>
            <th style={{ width: "8%" }}>No.</th>
            <th style={{ width: "32%" }}>Timeline Limits</th>
            <th style={{ width: "30%" }}>Given To</th>
            <th style={{ width: "30%" }}>Tracking Notes</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((data) => {
            const savedName = savedAllocations[data.no] || "";
            return (
              <tr key={data.no} className={data.rowStyleClass}>
                <td style={{ fontWeight: 700, textAlign: "center" }}>{data.no}</td>
                <td>
                  <div style={{ marginBottom: "2px" }}>
                    <EditableDate date={data.start} onSave={(val) => onDateChange(data.no, "start", val)} />
                  </div>
                  <div>
                    <EditableDate date={data.end} onSave={(val) => onDateChange(data.no, "end", val)} />
                  </div>
                </td>
                <td>
                  {savedName ? (
                    <span className="assigned-name">{savedName}</span>
                  ) : data.allowDropdown ? (
                    <AssignSelect
                      committeeNo={data.no}
                      memberAvailableSlots={memberAvailableSlots}
                      onAssign={onAssign}
                    />
                  ) : (
                    <span style={{ color: "#cbd5e1" }}>-</span>
                  )}
                </td>
                <td>
                  <EditableNote
                    value={savedNotes[data.no] || ""}
                    onSave={(text) => onNoteSave(data.no, text)}
                    onDelete={() => onNoteDelete(data.no)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
