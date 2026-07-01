import { Router } from "express";
import {
  getCommittees,
  getCommitteeByNo,
  updateCommittee,
  deleteNote,
  toggleChecklistDay,
} from "../controllers/committeeController.js";

const router = Router();

router.get("/", getCommittees);
router.get("/:committeeNo", getCommitteeByNo);
router.patch("/:committeeNo", updateCommittee);
router.delete("/:committeeNo/note", deleteNote);
router.patch("/:committeeNo/checklist", toggleChecklistDay);

export default router;
