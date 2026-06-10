import express from "express";
import {
  createOnboarding,
  getAllOnboardings,
  getSingleOnboarding,
  updateOnboarding,
  assignTeamMember,
  deleteOnboarding,
} from "../controllers/onboarding.controller.js";
import {
  protect,
  checkCRMAccess,
} from "../../../shared/middleware/auth.middleware.js";
import {
  authorizeRoles,
  adminOnly,
  managerOrAdmin,
} from "../../../shared/middleware/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(checkCRMAccess("sales"));

// ─── CRUD Routes ──────────────────────────────────────────
router
  .route("/")
  .get(getAllOnboardings)
  .post(
    authorizeRoles("admin", "sales_manager", "sales_closer"),
    createOnboarding
  );

router
  .route("/:id")
  .get(getSingleOnboarding)
  .put(
    authorizeRoles("admin", "sales_manager", "sales_closer"),
    updateOnboarding
  )
  .delete(adminOnly, deleteOnboarding);

// ─── Assign Team Member (Admin and Manager only) ──────────
router.put("/:id/assign", managerOrAdmin, assignTeamMember);

export default router;