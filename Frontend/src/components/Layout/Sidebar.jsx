import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiGrid,
  FiLogOut,
  FiSettings,
  FiX,
} from "react-icons/fi";

import {
  getModuleFromPath,
  formatRoleLabel,
} from "../../config/access.config.js";

import { getSidebarConfig } from "../../config/sidebar.config";

import "./Layout.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, hasRole } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
// console.log(getSidebarConfig());

  const moduleName = getModuleFromPath(location.pathname);
  const sidebar = getSidebarConfig(moduleName, user);
// console.log(sidebar);
console.log("MODULE:", moduleName);
console.log("ROLE:", user);
console.log("SIDEBAR:", sidebar);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`sidebar ${
        isOpen ? "sidebar-open" : ""
      }`}
    >
      <div className="sidebar-logo">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div className="sidebar-logo-icon">
            {sidebar.icon}
          </div>

          <div>
            <h2>{sidebar.title}</h2>

            <span className="sidebar-badge">
              {formatRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        <button
          className="sidebar-close-btn"
          onClick={toggleSidebar}
        >
          <FiX />
        </button>
      </div>

      <nav className="sidebar-nav">
        {hasRole(["admin"]) && (
          <div className="nav-section">
            <NavLink
              to="/crm-select"
              className="nav-link crm-back-link"
            >
              <FiGrid />
              <span>All CRM Modules</span>
            </NavLink>
          </div>
        )}

        {sidebar.sections.map((section) => (
          <div
            className="nav-section"
            key={section.title}
          >
            <span className="nav-section-title">
              {section.title}
            </span>

            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  <Icon />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}

        <div className="nav-section">
          <span className="nav-section-title">
            Account
          </span>

          <NavLink
            to={`/${moduleName}/settings`}
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            <FiSettings />
            <span>Settings</span>
          </NavLink>

          <button
            className="nav-link logout-btn"
            onClick={handleLogout}
          >
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
          <p className="sidebar-user-name">
            {user?.name}
          </p>

          <p className="sidebar-user-email">
            {user?.employee_id}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;