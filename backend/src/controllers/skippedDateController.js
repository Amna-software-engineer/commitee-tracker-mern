import SkippedDate from "../models/SkippedDate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// GET /api/skipped-dates
// Returns a plain array of "YYYY-MM-DD" strings, matching the shape the
// frontend's globalSkippedDates state already expects.
export const getSkippedDates = asyncHandler(async (req, res) => {
  const dates = await SkippedDate.find().sort({ date: 1 });
  res.json(dates.map((d) => d.date));
});

// POST /api/skipped-dates
// body: { date: "YYYY-MM-DD" }
export const addSkippedDate = asyncHandler(async (req, res) => {
  const { date } = req.body;
  if (!date) {
    res.status(400);
    throw new Error("date is required (YYYY-MM-DD)");
  }

  // Adding a date that's already skipped is a no-op, not an error -
  // keeps the "Skip Date" button idempotent from the frontend's side.
  const existing = await SkippedDate.findOne({ date });
  if (existing) {
    return res.json({ date: existing.date });
  }

  const created = await SkippedDate.create({ date });
  res.status(201).json({ date: created.date });
});

// DELETE /api/skipped-dates/:date  ("Undo Skip")
export const removeSkippedDate = asyncHandler(async (req, res) => {
  await SkippedDate.findOneAndDelete({ date: req.params.date });
  res.json({ date: req.params.date });
});
