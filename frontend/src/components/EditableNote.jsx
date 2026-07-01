import { useState } from "react";

export default function EditableNote({ value, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);

  const commit = (text) => {
    setEditing(false);
    const trimmed = text.trim();
    if (trimmed !== "") onSave(trimmed);
    else onDelete();
  };

  if (editing) {
    return (
      <input
        type="text"
        className="noteDynamicInput"
        defaultValue={value}
        placeholder="Type..."
        autoFocus
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(e.target.value);
        }}
      />
    );
  }

  if (value && value.trim() !== "") {
    return (
      <div className="note-container">
        <span className="note-text" onDoubleClick={() => setEditing(true)}>
          {value}
        </span>
        <span className="delete-note-btn" onClick={onDelete}>
          ❌
        </span>
      </div>
    );
  }

  return (
    <div className="note-container">
      <span className="add-note-placeholder" onClick={() => setEditing(true)}>
        + Note
      </span>
    </div>
  );
}
