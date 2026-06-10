import express from "express";

import {
  getMyTemplate,

  createOrUpdateSlotOne,
  createOrUpdateSlotTwo,

  // getTodayReport,
  getMyReports,
  getMyReportByDate,

  getTeamReports,
  getReportById,

  reviewReport,
} from "../controller/report.controller.js";

import {
  protect,
  checkCRMAccess,
} from "../../../shared/middleware/auth.middleware.js";
import { requireManagerOrAdmin } from "../../../shared/middleware/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(checkCRMAccess("daily"));

/*
|--------------------------------------------------------------------------
| Employee Routes
|--------------------------------------------------------------------------
*/

// Dynamic form template based on role
router.get("/template", getMyTemplate);

// Today's report
// router.get("/today", getTodayReport);

// Submit / Update Morning Slot
router.post("/slot-one", createOrUpdateSlotOne);

// Submit / Update Evening Slot
router.post("/slot-two", createOrUpdateSlotTwo);

// My report history
router.get("/my-reports", getMyReports);

// Single report by date
router.get("/my-reports/:date", getMyReportByDate);

/*
|--------------------------------------------------------------------------
| Manager / Admin Routes
|--------------------------------------------------------------------------
*/

// All employee reports
router.get(
  "/team",
  requireManagerOrAdmin,
  getTeamReports
);

// Single report details
router.get("/report/:reportId", getReportById);

// Manager review
router.patch(
  "/report/:reportId/review",
  requireManagerOrAdmin,
  reviewReport
);

export default router;
