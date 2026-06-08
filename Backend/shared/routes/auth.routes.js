import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  changePassword,
  changeUserPassword,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  adminOnly,
  managerOrAdmin,
} from "../middleware/role.middleware.js";

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/login", loginUser);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

// ─── Admin Only Routes ────────────────────────────────────────────────────────
router.post("/register", protect, adminOnly, registerUser);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

// ─── Admin Change Any User Password ──────────────────────────────────────────
router.put("/users/:id/change-password", protect, adminOnly, changeUserPassword);

// ─── Admin and Sales Manager Routes ──────────────────────────────────────────
router.get("/users", protect, managerOrAdmin, getAllUsers);

export default router;