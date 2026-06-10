import express from "express";
import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
} from "../controllers/role.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", listRoles);
router.post("/", adminOnly, createRole);
router.put("/:roleId", adminOnly, updateRole);
router.delete("/:roleId", adminOnly, deleteRole);

export default router;
