import mongoose from "mongoose";

const skippedDateSchema = new mongoose.Schema(
  {
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SkippedDate", skippedDateSchema);
