import express from "express";
import {
  createOnboarding,
  getAllOnboardings,
  getSingleOnboarding,
  updateOnboarding,
  assignTeamMember,
  deleteOnboarding,
  generateCredentialLink,
  getOnboardingByToken,
  submitCredentials,
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

// ─── PUBLIC Routes (client uses these) ────────────────────
router.get("/public/:token", getOnboardingByToken);
router.post("/public/:token/submit", submitCredentials);

// ─── Protected Routes ─────────────────────────────────────
router.use(protect);
router.use(checkCRMAccess("sales"));

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

router.put("/:id/assign", managerOrAdmin, assignTeamMember);

// ✅ Generate credential link (Admin, Manager, Closer)
router.post(
  "/:id/generate-credential-link",
  authorizeRoles("admin", "sales_manager", "sales_closer"),
  generateCredentialLink
);

export default router;