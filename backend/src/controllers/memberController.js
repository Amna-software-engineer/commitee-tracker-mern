import Member from "../models/Member.js";
import Committee from "../models/Committee.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// GET /api/members
// Returns each member with totalSlots and a live-computed availableSlots,
// same idea as the frontend's memberAvailableSlots useMemo, just done
// against the database instead of localStorage.
export const getMembers = asyncHandler(async (req, res) => {
  const members = await Member.find().sort({ name: 1 });
  const assignedCommittees = await Committee.find({ assignedTo: { $ne: "" } }, "assignedTo");

  const assignedCounts = {};
  assignedCommittees.forEach((c) => {
    assignedCounts[c.assignedTo] = (assignedCounts[c.assignedTo] || 0) + 1;
  });

  const result = members.map((m) => ({
    name: m.name,
    totalSlots: m.totalSlots,
    availableSlots: m.totalSlots - (assignedCounts[m.name] || 0),
  }));

  res.json(result);
});
