import { api } from "./client";

// GET /api/committees -> all 13 cycles, sorted by committeeNo
export const fetchCommittees = () => api.get("/committees");

// PATCH /api/committees/:committeeNo
// payload: any of { assignedTo, note, manualStart, manualEnd }
export const patchCommittee = (committeeNo, payload) =>
  api.patch(`/committees/${committeeNo}`, payload);

// DELETE /api/committees/:committeeNo/note
export const deleteCommitteeNote = (committeeNo) =>
  api.delete(`/committees/${committeeNo}/note`);

// PATCH /api/committees/:committeeNo/checklist
// Omitting `checked` flips the day's current value (matches the old
// onToggleDay click-to-toggle behavior).
export const toggleChecklistDay = (committeeNo, dayIndex, checked) =>
  api.patch(
    `/committees/${committeeNo}/checklist`,
    checked === undefined ? { dayIndex } : { dayIndex, checked }
  );
