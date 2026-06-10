import express from "express";
import {
  createDeal,
  getAllDeals,
  getSingleDeal,
  updateDeal,
  deleteDeal,
  addMeeting,
  updateMeetingOutcome,
  getDealStats,
} from "../controllers/deal.controller.js";
import { protect, checkCRMAccess } from "../../../shared/middleware/auth.middleware.js";
import {
  authorizeRoles,
  adminOnly,
  managerOrAdmin,
} from "../../../shared/middleware/role.middleware.js";

const router = express.Router();

// All deal routes need login + sales CRM access
router.use(protect);
router.use(checkCRMAccess("sales"));

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get("/stats", getDealStats);

// ─── Deal CRUD ────────────────────────────────────────────────────────────────
router
  .route("/")
  .get(getAllDeals) // All roles (filtered inside)
  .post(managerOrAdmin("admin", "sales_manager"), createDeal); // Manager or Admin creates deal

router
  .route("/:id")
  .get(getSingleDeal)
  .put(
    authorizeRoles("admin", "sales_manager", "sales_closer"),
    updateDeal
  )
  .delete(adminOnly, deleteDeal);

// ─── Meeting Routes ───────────────────────────────────────────────────────────
router.post(
  "/:id/meetings",
  authorizeRoles("admin", "sales_manager", "sales_closer"),
  addMeeting
);

router.put(
  "/:dealId/meetings/:meetingId",
  authorizeRoles("admin", "sales_manager", "sales_closer"),
  updateMeetingOutcome
);

export default router;