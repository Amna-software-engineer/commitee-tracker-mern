import Committee from "../models/Committee.js";
import Member from "../models/Member.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// GET /api/committees
export const getCommittees = asyncHandler(async (req, res) => {
  const committees = await Committee.find().sort({ committeeNo: 1 });
  res.json(committees);
});

// GET /api/committees/:committeeNo
export const getCommitteeByNo = asyncHandler(async (req, res) => {
  const committee = await Committee.findOne({ committeeNo: req.params.committeeNo });
  if (!committee) {
    res.status(404);
    throw new Error(`Committee ${req.params.committeeNo} not found`);
  }
  res.json(committee);
});

// PATCH /api/committees/:committeeNo
// body: any of { assignedTo, note, manualStart, manualEnd }
// Only the fields present in the body get updated - same "partial update"
// idea as the frontend's onAssign / onNoteSave / onDateChange handlers.
export const updateCommittee = asyncHandler(async (req, res) => {
  const committee = await Committee.findOne({ committeeNo: req.params.committeeNo });
  if (!committee) {
    res.status(404);
    throw new Error(`Committee ${req.params.committeeNo} not found`);
  }

  const { assignedTo, note, manualStart, manualEnd } = req.body;

  // Assigning a member is the one field that needs a business rule check:
  // don't let a committee go to someone with zero slots left.
  if (assignedTo !== undefined && assignedTo !== committee.assignedTo) {
    if (assignedTo === "") {
      committee.assignedTo = "";
    } else {
      const member = await Member.findOne({ name: assignedTo });
      if (!member) {
        res.status(400);
        throw new Error(`Unknown member "${assignedTo}"`);
      }

      const takenCount = await Committee.countDocuments({ assignedTo });
      if (takenCount >= member.totalSlots) {
        res.status(400);
        throw new Error(`${assignedTo} has no available slots left`);
      }

      committee.assignedTo = assignedTo;
    }
  }

  if (note !== undefined) committee.note = note;
  if (manualStart !== undefined) committee.manualStart = manualStart;
  if (manualEnd !== undefined) committee.manualEnd = manualEnd;

  await committee.save();
  res.json(committee);
});

// DELETE /api/committees/:committeeNo/note
export const deleteNote = asyncHandler(async (req, res) => {
  const committee = await Committee.findOneAndUpdate(
    { committeeNo: req.params.committeeNo },
    { note: "" },
    { new: true }
  );
  if (!committee) {
    res.status(404);
    throw new Error(`Committee ${req.params.committeeNo} not found`);
  }
  res.json(committee);
});

// PATCH /api/committees/:committeeNo/checklist
// body: { dayIndex: number, checked?: boolean }
// If `checked` is omitted, the day is simply flipped (matches the old
// onToggleDay behavior of toggling on click).
export const toggleChecklistDay = asyncHandler(async (req, res) => {
  const { dayIndex, checked } = req.body;

  if (typeof dayIndex !== "number" || dayIndex < 0) {
    res.status(400);
    throw new Error("dayIndex must be a non-negative number");
  }

  const committee = await Committee.findOne({ committeeNo: req.params.committeeNo });
  if (!committee) {
    res.status(404);
    throw new Error(`Committee ${req.params.committeeNo} not found`);
  }

  if (dayIndex >= committee.checklist.length) {
    res.status(400);
    throw new Error(`dayIndex out of range (checklist has ${committee.checklist.length} days)`);
  }

  committee.checklist[dayIndex] = checked !== undefined ? !!checked : !committee.checklist[dayIndex];

  await committee.save();
  res.json(committee);
});
