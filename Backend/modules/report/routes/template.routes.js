import express from "express";

import {
  createTemplate,
  getTemplates,
  getTemplateByRole,
  updateTemplate,
  deleteTemplate,
} from "../controller/template.controller.js";

import {
  protect,
  checkCRMAccess,
} from "../../../shared/middleware/auth.middleware.js";

import { adminOnly } from "../../../shared/middleware/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(checkCRMAccess("daily"));

router.post(
  "/",
  adminOnly,
  createTemplate
);

router.get(
  "/",
  adminOnly,
  getTemplates
);

router.get(
  "/:role",
  adminOnly,
  getTemplateByRole
);

router.put(
  "/:templateId",
  adminOnly,
  updateTemplate
);

router.delete(
  "/:templateId",
  adminOnly,
  deleteTemplate
);

export default router;
