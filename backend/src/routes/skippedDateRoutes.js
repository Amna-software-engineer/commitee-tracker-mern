import { Router } from "express";
import {
  getSkippedDates,
  addSkippedDate,
  removeSkippedDate,
} from "../controllers/skippedDateController.js";

const router = Router();

router.get("/", getSkippedDates);
router.post("/", addSkippedDate);
router.delete("/:date", removeSkippedDate);

export default router;
