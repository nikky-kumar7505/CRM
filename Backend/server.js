import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import notificationRoutes from "./shared/routes/notification.routes.js";

// ─── Config ───────────────────────────────────────────────────────────────────
dotenv.config();

import connectDB from "./config/db.js";

// ─── Route Imports ────────────────────────────────────────────────────────────
import authRoutes from "./shared/routes/auth.routes.js";
import leadRoutes from "./modules/sales/routes/lead.routes.js";
import dealRoutes from "./modules/sales/routes/deal.routes.js";
import attendanceRoutes from "./modules/attendance/routes/attendance.routes.js";

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── For __dirname in ES Modules ─────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(helmet()); // Security headers
app.use(cors()); // Allow frontend to connect
app.use(morgan("dev")); // Log requests in terminal
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use("/api/notifications", notificationRoutes);

// ─── Static Files (for call recordings, uploads) ─────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/sales/leads", leadRoutes);
app.use("/api/sales/deals", dealRoutes);
app.use("/api/attendance", attendanceRoutes);

// ─── Home Route ───────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sales CRM API is running.",
    version: "1.0.0",
    modules: {
      auth: "/api/auth",
      sales_leads: "/api/sales/leads",
      sales_deals: "/api/sales/deals",
      attendance: "/api/attendance",
    },
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});