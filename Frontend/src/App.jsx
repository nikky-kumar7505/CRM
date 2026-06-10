import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import CredentialForm from "./pages/Credentials/CredentialForm.jsx";

import MainLayout from "./components/Layout/MainLayout.jsx";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";
import AccessRoute from "./components/Auth/AccessRoute.jsx";

import Login from "./pages/Auth/Login.jsx";
import Settings from "./pages/Auth/Settings.jsx";

import CRMSelect from "./pages/CRMSelect/CRMSelect.jsx";

import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Users from "./pages/Users/Users.jsx";
import Leads from "./pages/Leads/Leads.jsx";
import Deals from "./pages/Deals/Deals.jsx";

import HotLeads from "./pages/HotLeads/HotLeads.jsx";
import FollowUp from "./pages/FollowUp/FollowUp.jsx";
import Onboarding from "./pages/Onboarding/Onboarding.jsx";
import RetainableClients from "./pages/Clients/RetainableClients.jsx";
import NonRetainableClients from "./pages/Clients/NonRetainableClients.jsx";

import ReportDashboard from "./pages/DailyTask/ReportDashboard/ReportDashboard.jsx";
import CreateTemplate from "./pages/DailyTask/CreateTemplate/CreateTemplate.jsx";
import TemplatesPage from "./pages/DailyTask/TemplatesPage.jsx";
import ReportSubmissionPage from "./pages/DailyTask/ReportSubmissionPage.jsx";
import ReportHistoryPage from "./pages/DailyTask/ReportHistoryPage.jsx";
import ReportDetailPage from "./pages/DailyTask/ReportDetailPage.jsx";
import PerformancePage from "./pages/DailyTask/PerformancePage.jsx";

import Unauthorized from "./pages/Unauthorized/Unauthorized.jsx";

import {
  getLandingPath,
  hasModuleAccess,
} from "./config/access.config.js";

import "./styles/global.css";

const ComingSoon = ({ title }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f8f8f8 0%, #f7e7ce 100%)",
      padding: "20px",
    }}
  >
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "60px 40px",
        textAlign: "center",
        maxWidth: "500px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>

      <h1
        style={{
          fontSize: "24px",
          fontFamily: "'Space Grotesk', sans-serif",
          color: "#121212",
          marginBottom: "12px",
        }}
      >
        {title || "Coming Soon"}
      </h1>

      <p
        style={{
          fontSize: "14px",
          color: "#797e88",
          marginBottom: "24px",
        }}
      >
        This module is currently under development.
      </p>

      <a
        href="/crm-select"
        style={{
          padding: "12px 28px",
          borderRadius: "8px",
          background: "#10443E",
          color: "white",
          fontSize: "14px",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        ← Back to CRM Selection
      </a>
    </div>
  </div>
);

const RootRedirect = () => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: "100vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getLandingPath(user)} replace />;
};

const LegacySalesRedirect = ({ targetPath }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: "100vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasModuleAccess(user, "sales")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Navigate to={targetPath} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="/" element={<RootRedirect />} />
    <Route path="/credentials/:token" element={<CredentialForm />} />


    <Route element={<ProtectedRoute />}>
      <Route
        path="/crm-select"
        element={
          <AccessRoute roles={["admin"]}>
            <CRMSelect />
          </AccessRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <AccessRoute roles={["admin"]}>
            <ComingSoon title="Attendance CRM" />
          </AccessRoute>
        }
      />

      <Route
        path="/activity"
        element={
          <AccessRoute roles={["admin"]}>
            <ComingSoon title="Activity CRM" />
          </AccessRoute>
        }
      />

      <Route
        path="/sales"
        element={
          <AccessRoute moduleName="sales">
            <MainLayout />
          </AccessRoute>
        }
      >
        <Route index element={<Navigate to="/sales/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="deals" element={<Deals />} />

        <Route path="hot-leads" element={<HotLeads />} />
        <Route path="follow-up" element={<FollowUp />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="retainable" element={<RetainableClients />} />
        <Route path="non-retainable" element={<NonRetainableClients />} />

        <Route path="report" element={<ReportSubmissionPage />} />
        <Route
          path="history"
          element={<ReportHistoryPage scope="mine" />}
        />

        <Route
          path="users"
          element={
            <AccessRoute roles={["admin", "sales_manager"]}>
              <Users />
            </AccessRoute>
          }
        />

        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="/daily"
        element={
          <AccessRoute moduleName="daily">
            <MainLayout />
          </AccessRoute>
        }
      >
        <Route index element={<Navigate to="/daily/dashboard" replace />} />

        <Route path="dashboard" element={<ReportDashboard />} />

        <Route path="report" element={<ReportSubmissionPage />} />

        <Route
          path="history"
          element={<ReportHistoryPage scope="mine" />}
        />

        <Route
          path="reports/:reportId"
          element={<ReportDetailPage />}
        />

        <Route
          path="team-reports"
          element={
            <AccessRoute managerOnly>
              <ReportHistoryPage scope="team" />
            </AccessRoute>
          }
        />

        <Route
          path="weekly-performance"
          element={<PerformancePage mode="weekly" />}
        />

        <Route
          path="monthly-performance"
          element={<PerformancePage mode="monthly" />}
        />

        <Route
          path="team-performance"
          element={
            <AccessRoute managerOnly>
              <PerformancePage mode="team" />
            </AccessRoute>
          }
        />

        <Route
          path="create-template"
          element={
            <AccessRoute roles={["admin"]}>
              <CreateTemplate />
            </AccessRoute>
          }
        />

        <Route
          path="all-templates"
          element={
            <AccessRoute roles={["admin"]}>
              <TemplatesPage />
            </AccessRoute>
          }
        />

        <Route path="settings" element={<Settings />} />
      </Route>
    </Route>

    <Route
      path="/dashboard"
      element={
        <LegacySalesRedirect targetPath="/sales/dashboard" />
      }
    />

    <Route
      path="/leads"
      element={
        <LegacySalesRedirect targetPath="/sales/leads" />
      }
    />

    <Route
      path="/deals"
      element={
        <LegacySalesRedirect targetPath="/sales/deals" />
      }
    />

    <Route
      path="/users"
      element={
        <LegacySalesRedirect targetPath="/sales/users" />
      }
    />

    <Route
      path="/settings"
      element={
        <LegacySalesRedirect targetPath="/sales/settings" />
      }
    />

    <Route path="*" element={<RootRedirect />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;