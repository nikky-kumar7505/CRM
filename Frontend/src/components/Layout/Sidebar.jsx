import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiHome,
  FiUsers,
  FiPhoneCall,
  FiBriefcase,
  FiLogOut,
  FiSettings,
  FiGrid,
  FiX,
  FiClock,
  FiZap,
  FiCheckCircle,
  FiUserX,
  FiUserCheck,
} from "react-icons/fi";
import "./Layout.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, hasRole, hasCRMAccess } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="sidebar-logo-icon">S</div>
          <div>
            <h2>Sales CRM</h2>
            <span className="sidebar-badge">
              {user?.role?.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          <FiX />
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* ─── All CRM Modules (Admin Only) ─────────────── */}
        {hasRole(["admin"]) && (
          <div className="nav-section">
            <NavLink to="/crm-select" className="nav-link crm-back-link">
              <FiGrid />
              <span>All CRM Modules</span>
            </NavLink>
          </div>
        )}

        {/* ─── Main ─────────────────────────────────────── */}
        <div className="nav-section">
          <span className="nav-section-title">Main</span>
          <NavLink
            to="/sales/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FiHome />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* ─── Sales CRM ────────────────────────────────── */}
        {hasCRMAccess("sales") && (
          <div className="nav-section">
            <span className="nav-section-title">Sales CRM</span>

            {/* ✅ Leads - NOT for sales closer */}
            {!hasRole(["sales_closer"]) && (
              <NavLink
                to="/sales/leads"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <FiPhoneCall />
                <span>Leads</span>
              </NavLink>
            )}

            {/* ✅ Hot Leads - Lead Qualifier only */}
            {hasRole(["lead_qualifier"]) && (
              <NavLink
                to="/sales/hot-leads"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <FiZap />
                <span>Hot Leads</span>
              </NavLink>
            )}

            {/* ✅ Follow Up - Lead Qualifier only */}
            {hasRole(["lead_qualifier"]) && (
              <NavLink
                to="/sales/follow-up"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <FiClock />
                <span>Follow Up</span>
              </NavLink>
            )}

            {/* Deals - for admin, manager, closer */}
            {!hasRole(["lead_qualifier"]) && (
              <NavLink
                to="/sales/deals"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <FiBriefcase />
                <span>Deals</span>
              </NavLink>
            )}

            {/* ✅ Onboarding - Admin and Closer */}
            {hasRole(["admin", "sales_manager", "sales_closer"]) && (
              <NavLink
                to="/sales/onboarding"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <FiCheckCircle />
                <span>Onboarding Clients</span>
              </NavLink>
            )}

            {/* ✅ Retainable Clients - Admin and Manager */}
            {hasRole(["admin", "sales_manager"]) && (
              <NavLink
                to="/sales/retainable"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <FiUserCheck />
                <span>Retainable Clients</span>
              </NavLink>
            )}

            {/* ✅ Non-Retainable Clients - Admin and Manager */}
            {hasRole(["admin", "sales_manager"]) && (
              <NavLink
                to="/sales/non-retainable"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <FiUserX />
                <span>Non-Retainable</span>
              </NavLink>
            )}
          </div>
        )}

        {/* ─── Management ───────────────────────────────── */}
        {hasRole(["admin", "sales_manager"]) && (
          <div className="nav-section">
            <span className="nav-section-title">Management</span>
            <NavLink
              to="/sales/users"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <FiUsers />
              <span>Users</span>
            </NavLink>
          </div>
        )}

        {/* ─── Account ──────────────────────────────────── */}
        <div className="nav-section">
          <span className="nav-section-title">Account</span>
          <NavLink
            to="/sales/settings"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FiSettings />
            <span>Settings</span>
          </NavLink>
          <button className="nav-link logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user?.name}</p>
          <p className="sidebar-user-email">{user?.employee_id}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;