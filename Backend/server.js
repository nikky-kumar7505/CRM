import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

import notificationRoutes from "./shared/routes/notification.routes.js";
import authRoutes from "./shared/routes/auth.routes.js";
import roleRoutes from "./shared/routes/role.routes.js";

import leadRoutes from "./modules/sales/routes/lead.routes.js";
import dealRoutes from "./modules/sales/routes/deal.routes.js";
import onboardingRoutes from "./modules/sales/routes/onboarding.routes.js";

import attendanceRoutes from "./modules/attendance/routes/attendance.routes.js";

import reportRoutes from "./modules/report/routes/report.routes.js";
import templateRoutes from "./modules/report/routes/template.routes.js";
import performanceRoutes from "./modules/report/routes/performance.routes.js";

import { ensureDefaultRoles } from "./shared/utils/role.utils.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/notifications", notificationRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);

app.use("/api/sales/leads", leadRoutes);
app.use("/api/sales/deals", dealRoutes);
app.use("/api/sales/onboarding", onboardingRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/daily", reportRoutes);
app.use("/api/template", templateRoutes);
app.use("/api/daily", performanceRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sales CRM API is running.",
    version: "1.0.0",
    modules: {
      auth: "/api/auth",
      roles: "/api/roles",
      sales_leads: "/api/sales/leads",
      sales_deals: "/api/sales/deals",
      attendance: "/api/attendance",
      daily: "/api/daily",
      templates: "/api/template",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : undefined,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await ensureDefaultRoles();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();