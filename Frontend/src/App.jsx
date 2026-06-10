import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import MainLayout from "./components/Layout/MainLayout.jsx";
import Login from "./pages/Auth/Login.jsx";
import CRMSelect from "./pages/CRMSelect/CRMSelect.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Users from "./pages/Users/Users.jsx";
import Leads from "./pages/Leads/Leads.jsx";
import Deals from "./pages/Deals/Deals.jsx";
import Settings from "./pages/Auth/Settings.jsx";
import HotLeads from "./pages/HotLeads/HotLeads.jsx";
import FollowUp from "./pages/FollowUp/FollowUp.jsx";
import Onboarding from "./pages/Onboarding/Onboarding.jsx";
import RetainableClients from "./pages/Clients/RetainableClients.jsx";
import NonRetainableClients from "./pages/Clients/NonRetainableClients.jsx";
import "./styles/global.css";

const ComingSoon = ({ title }) => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f8f8f8 0%, #f7e7ce 100%)" }}>
    <div style={{ background: "white", borderRadius: "16px", padding: "60px 40px", textAlign: "center", maxWidth: "500px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
      <h1 style={{ fontSize: "24px", fontFamily: "'Space Grotesk', sans-serif", marginBottom: "12px" }}>{title || "Coming Soon"}</h1>
      <p style={{ color: "#797e88", marginBottom: "24px" }}>Under development.</p>
      <a href="/crm-select" style={{ padding: "12px 28px", borderRadius: "8px", background: "#10443E", color: "white", textDecoration: "none" }}>← Back</a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/crm-select" element={<CRMSelect />} />
          <Route path="/attendance" element={<ComingSoon title="Attendance CRM" />} />
          <Route path="/activity" element={<ComingSoon title="Activity CRM" />} />

          <Route path="/sales" element={<MainLayout />}>
            <Route index element={<Navigate to="/sales/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="deals" element={<Deals />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="hot-leads" element={<HotLeads />} />
            <Route path="follow-up" element={<FollowUp />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="retainable" element={<RetainableClients />} />
            <Route path="non-retainable" element={<NonRetainableClients />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Navigate to="/sales/dashboard" replace />} />
          <Route path="/leads" element={<Navigate to="/sales/leads" replace />} />
          <Route path="/deals" element={<Navigate to="/sales/deals" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;