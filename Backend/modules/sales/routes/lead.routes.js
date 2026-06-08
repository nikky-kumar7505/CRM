import express from "express";
import {
  createLead,
  getAllLeads,
  getSingleLead,
  updateLead,
  deleteLead,
  assignLead,
  addCallLog,
  passLeadToCloser,
  getLeadStats,
  uploadCSVLeads,
  bulkUpdateLeads,
} from "../controllers/lead.controller.js";
import {
  protect,
  checkCRMAccess,
} from "../../../shared/middleware/auth.middleware.js";
import {
  authorizeRoles,
  adminOnly,
  managerOrAdmin,
} from "../../../shared/middleware/role.middleware.js";
import multer from "multer";

// ─── Multer for CSV upload ────────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.originalname.endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files allowed"), false);
    }
  },
});

const router = express.Router();

router.use(protect);
router.use(checkCRMAccess("sales"));

// ─── Stats ────────────────────────────────────────────────
router.get("/stats", getLeadStats);

// ─── Bulk Update (Lead Qualifier) ─────────────────────────
router.put(
  "/bulk-update",
  authorizeRoles("admin", "sales_manager", "lead_qualifier"),
  bulkUpdateLeads
);

// ─── CSV Upload ───────────────────────────────────────────
router.post(
  "/csv-upload",
  managerOrAdmin,
  upload.single("csv_file"),
  uploadCSVLeads
);

// ─── CRUD ─────────────────────────────────────────────────
router
  .route("/")
  .get(getAllLeads)
  .post(managerOrAdmin, createLead);

router
  .route("/:id")
  .get(getSingleLead)
  .put(
    authorizeRoles("admin", "sales_manager", "lead_qualifier"),
    updateLead
  )
  .delete(managerOrAdmin, deleteLead);

// ─── Special Routes ───────────────────────────────────────
router.put("/:id/assign", managerOrAdmin, assignLead);
router.post(
  "/:id/call-log",
  authorizeRoles("admin", "sales_manager", "lead_qualifier"),
  addCallLog
);
router.put(
  "/:id/pass-to-closer",
  authorizeRoles("admin", "sales_manager", "lead_qualifier"),
  passLeadToCloser
);

export default router;