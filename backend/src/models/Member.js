import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Member name is required"],
      unique: true,
      trim: true,
    },
    totalSlots: {
      type: Number,
      required: [true, "totalSlots is required"],
      min: [0, "totalSlots cannot be negative"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Member", memberSchema);
