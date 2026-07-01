import mongoose from "mongoose";
import { DURATION } from "../config/constants.js";

const committeeSchema = new mongoose.Schema(
  {
    committeeNo: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    // Name of the member this cycle's pool was given to, or "" if unassigned.
    assignedTo: {
      type: String,
      default: "",
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    // Manual overrides for the calculated start/end date, stored as
    // "YYYY-MM-DD" strings so the frontend can drop them straight into an
    // <input type="date">. null means "use the calculated date".
    manualStart: {
      type: String,
      default: null,
    },
    manualEnd: {
      type: String,
      default: null,
    },
    // One boolean per day of the cycle - true once that day's cash was saved.
    checklist: {
      type: [Boolean],
      default: () => Array(DURATION).fill(false),
    },
  },
  { timestamps: true }
);

export default mongoose.model("Committee", committeeSchema);
