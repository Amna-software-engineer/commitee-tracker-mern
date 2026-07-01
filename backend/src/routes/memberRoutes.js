import { Router } from "express";
import { getMembers } from "../controllers/memberController.js";

const router = Router();

router.get("/", getMembers);

export default router;
