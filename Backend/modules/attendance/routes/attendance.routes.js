import express from "express";
import {
  getAttendance,
  markAttendance,
} from "../controllers/attendance.controller.js";
import { protect, checkCRMAccess } from "../../../shared/middleware/auth.middleware.js";

const router = express.Router();

// All attendance routes need login + attendance CRM access
router.use(protect);
router.use(checkCRMAccess("attendance"));

// ─── Attendance Routes (Placeholder) ─────────────────────────────────────────
router.get("/", getAttendance);
router.post("/mark", markAttendance);

export default router;