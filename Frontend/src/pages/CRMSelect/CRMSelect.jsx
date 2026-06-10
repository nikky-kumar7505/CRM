import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiBriefcase,
  FiCalendar,
  FiActivity,
  FiLogOut,
} from "react-icons/fi";
import "./CRMSelect.css";

const CRMSelect = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ─── 3 CRM Modules ────────────────────────────────────────
  const crmModules = [
    {
      id: "sales",
      name: "Sales CRM",
      description:
        "Manage leads, assign qualifiers, track deals and close clients through complete sales pipeline.",
      icon: <FiBriefcase />,
      iconColor: "#10443E",
      iconBg: "#e8f5f3",
      active: true,
      badge: "Active",
      badgeClass: "badge-active",
      path: "/sales/dashboard",
    },
    {
      id: "daily_report",
      name: "Daily Report",
      description:
        "Manage leads, assign qualifiers, track deals and close clients through complete sales pipeline.",
      icon: <FiActivity />,
      iconColor: "#10443E",
      iconBg: "#e8f5f3",
      active: true,
      badge: "Active",
      badgeClass: "badge-active",
      path: "/daily/",
    },
    {
      id: "attendance",
      name: "Attendance CRM",
      description:
        "Track employee daily attendance, check-in check-out times, leaves and working hours.",
      icon: <FiCalendar />,
      iconColor: "#D4AF37",
      iconBg: "#f7e7ce",
      active: false,
      badge: "Coming Soon",
      badgeClass: "badge-soon",
      path: "/attendance",
    },
    {
      id: "activity",
      name: "Activity CRM",
      description:
        "Monitor team activities, task management, productivity tracking and performance reports.",
      icon: <FiActivity />,
      iconColor: "#6f42c1",
      iconBg: "#f0ebff",
      active: false,
      badge: "Coming Soon",
      badgeClass: "badge-soon",
      path: "/activity",
    },
  ];

  const handleCRMClick = (crm) => {
    navigate(crm.path);
  };

  return (
    <div className="crm-select-page">
      {/* ─── Top Header ──────────────────────────────────── */}
      <div className="crm-select-header">
        <div className="crm-select-brand">
          <div className="crm-select-logo">S</div>
          <div>
            <h1 className="crm-select-title">Sales CRM Platform</h1>
            <p className="crm-select-sub">
              Welcome back, <strong>{user?.name}</strong> —{" "}
              {user?.employee_id}
            </p>
          </div>
        </div>
        <button className="crm-logout-btn" onClick={handleLogout}>
          <FiLogOut style={{ marginRight: "6px" }} />
          Logout
        </button>
      </div>

      {/* ─── Section Title ───────────────────────────────── */}
      <div className="crm-section-label">
        Select a CRM module to continue
      </div>

      {/* ─── CRM Cards Grid (3 in a row) ─────────────────── */}
      <div className="crm-grid">
        {crmModules.map((crm) => (
          <div
            key={crm.id}
            className={`crm-card ${!crm.active ? "crm-card-disabled" : ""}`}
            onClick={() => handleCRMClick(crm)}
          >
            {/* Icon */}
            <div
              className="crm-card-icon"
              style={{
                background: crm.iconBg,
                color: crm.iconColor,
              }}
            >
              {crm.icon}
            </div>

            {/* Title */}
            <h3 className="crm-card-title">{crm.name}</h3>

            {/* Description */}
            <p className="crm-card-desc">{crm.description}</p>

            {/* Badge */}
            <span className={`crm-badge ${crm.badgeClass}`}>
              {crm.badge}
            </span>

            {/* Arrow on active */}
            {crm.active && (
              <div className="crm-card-arrow">Open →</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CRMSelect;