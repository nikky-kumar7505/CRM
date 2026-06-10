import express from "express";

import {
  protect,
  checkCRMAccess,
} from "../../../shared/middleware/auth.middleware.js";

import {
  getMyWeeklyPerformance,
  getMyMonthlyPerformance,
  getTeamPerformance,
} from "../controller/performance.controller.js";
import { requireManagerOrAdmin } from "../../../shared/middleware/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(checkCRMAccess("daily"));

router.get("/performance/weekly", getMyWeeklyPerformance);

router.get("/performance/monthly", getMyMonthlyPerformance);

router.get(
  "/team/performance",
  requireManagerOrAdmin,
  getTeamPerformance
);

export default router;
