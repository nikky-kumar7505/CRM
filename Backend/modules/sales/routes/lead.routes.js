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
  closeLeadByQualifier,
  getFollowUpLeads,
  getHotLeads,
} from "../controllers/lead.controller.js";
import {
  protect,
  checkCRMAccess,
} from "../../../shared/middleware/auth.middleware.js";
import {
  authorizeRoles,
  managerOrAdmin,
} from "../../../shared/middleware/role.middleware.js";
import multer from "multer";

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

// ─── Stats and Special Routes ─────────────────────────────
router.get("/stats", getLeadStats);
router.get("/follow-up", getFollowUpLeads);
router.get("/hot-leads", getHotLeads);

router.put(
  "/bulk-update",
  authorizeRoles("admin", "sales_manager", "lead_qualifier"),
  bulkUpdateLeads
);

router.post(
  "/csv-upload",
  managerOrAdmin("admin", "sales_manager"),
  upload.single("csv_file"),
  uploadCSVLeads
);

// ─── CRUD ─────────────────────────────────────────────────
router
  .route("/")
  .get(getAllLeads)
  .post(managerOrAdmin("admin", "sales_manager"), createLead);

router
  .route("/:id")
  .get(getSingleLead)
  .put(
    authorizeRoles("admin", "sales_manager", "lead_qualifier"),
    updateLead
  )
  .delete(managerOrAdmin("admin", "sales_manager"), deleteLead);

// ─── Special Routes ───────────────────────────────────────
router.put("/:id/assign", managerOrAdmin("admin", "sales_manager"), assignLead);
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
router.put(
  "/:id/close",
  authorizeRoles("admin", "sales_manager", "lead_qualifier"),
  closeLeadByQualifier
);

export default router;