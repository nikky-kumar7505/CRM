import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import "./Layout.css";

const MainLayout = () => {
  const { token, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="loading"
        style={{ height: "100vh" }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div
      className={`layout ${
        sidebarOpen ? "sidebar-is-open" : "sidebar-is-closed"
      }`}
    >
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="main-content">
        <Header
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        <main className="main-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;