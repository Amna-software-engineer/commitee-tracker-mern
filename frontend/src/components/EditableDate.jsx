import { useState } from "react";
import { formatDateMobile, formatDateToInput } from "../utils/dateHelpers";

export default function EditableDate({ date, onSave }) {
  const [editing, setEditing] = useState(false);
  const rawValue = formatDateToInput(date);

  if (editing) {
    return (
      <input
        type="date"
        defaultValue={rawValue}
        autoFocus
        onBlur={(e) => {
          setEditing(false);
          if (e.target.value) onSave(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            if (e.target.value) onSave(e.target.value);
          }
        }}
      />
    );
  }

  return (
    <span className="editable-date" onDoubleClick={() => setEditing(true)}>
      {formatDateMobile(date)}
    </span>
  );
}
