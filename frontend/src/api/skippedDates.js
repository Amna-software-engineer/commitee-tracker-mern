import { api } from "./client";

// GET /api/skipped-dates -> ["YYYY-MM-DD", ...]
export const fetchSkippedDates = () => api.get("/skipped-dates");

// POST /api/skipped-dates  body: { date }
export const addSkippedDate = (date) => api.post("/skipped-dates", { date });

// DELETE /api/skipped-dates/:date  ("Undo Skip")
export const removeSkippedDate = (date) => api.delete(`/skipped-dates/${date}`);
